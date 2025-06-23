from flask import Blueprint, jsonify, request, send_file
import openai
import os
import tempfile
import uuid
from datetime import datetime
from src.models.user import ChatMessage, ChatSession, db

audio_bp = Blueprint('audio', __name__)

# Configuração CORS
@audio_bp.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Configurar OpenAI API Key (deve ser definida como variável de ambiente)
openai.api_key = os.getenv('OPENAI_API_KEY')

@audio_bp.route('/speech-to-text', methods=['POST'])
def speech_to_text():
    """Converte áudio do usuário em texto usando OpenAI Whisper"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'Arquivo de áudio não encontrado'}), 400
        
        audio_file = request.files['audio']
        session_id = request.form.get('session_id')
        
        if not session_id:
            return jsonify({'error': 'session_id é obrigatório'}), 400
        
        # Verifica se a sessão existe
        session_obj = ChatSession.query.get_or_404(session_id)
        
        # Salva o arquivo temporariamente
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            
            # Usa OpenAI Whisper para transcrever
            with open(temp_file.name, 'rb') as audio:
                transcript = openai.Audio.transcribe(
                    model="whisper-1",
                    file=audio,
                    language="pt"  # Português
                )
            
            # Remove arquivo temporário
            os.unlink(temp_file.name)
        
        # Salva a mensagem transcrita no banco
        message = ChatMessage(
            session_id=session_id,
            sender='user',
            message=transcript.text,
            tokens_used=0  # Whisper não usa tokens GPT
        )
        
        db.session.add(message)
        session_obj.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'transcription': transcript.text,
            'message_id': message.id,
            'timestamp': message.timestamp.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao processar áudio: {str(e)}'}), 500

@audio_bp.route('/text-to-speech', methods=['POST'])
def text_to_speech():
    """Converte texto da IA em áudio usando OpenAI TTS"""
    try:
        data = request.json
        
        if not data.get('text'):
            return jsonify({'error': 'Texto é obrigatório'}), 400
        
        text = data['text']
        voice = data.get('voice', 'nova')  # Voz padrão mais natural
        session_id = data.get('session_id')
        
        # Verifica se a sessão existe (opcional)
        if session_id:
            session_obj = ChatSession.query.get_or_404(session_id)
        
        # Gera áudio usando OpenAI TTS
        response = openai.Audio.speech.create(
            model="tts-1",
            voice=voice,  # alloy, echo, fable, onyx, nova, shimmer
            input=text,
            speed=1.0
        )
        
        # Salva o arquivo de áudio temporariamente
        audio_filename = f"audio_{uuid.uuid4().hex[:8]}.mp3"
        audio_path = os.path.join(tempfile.gettempdir(), audio_filename)
        
        with open(audio_path, 'wb') as audio_file:
            for chunk in response.iter_bytes():
                audio_file.write(chunk)
        
        return jsonify({
            'audio_url': f'/api/audio/download/{audio_filename}',
            'text': text,
            'voice': voice
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao gerar áudio: {str(e)}'}), 500

@audio_bp.route('/download/<filename>', methods=['GET'])
def download_audio(filename):
    """Serve arquivos de áudio gerados"""
    try:
        audio_path = os.path.join(tempfile.gettempdir(), filename)
        
        if not os.path.exists(audio_path):
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        
        return send_file(
            audio_path,
            as_attachment=False,
            mimetype='audio/mpeg'
        )
        
    except Exception as e:
        return jsonify({'error': f'Erro ao servir áudio: {str(e)}'}), 500

@audio_bp.route('/voices', methods=['GET'])
def get_available_voices():
    """Retorna lista de vozes disponíveis"""
    voices = [
        {
            'id': 'alloy',
            'name': 'Alloy',
            'description': 'Voz neutra e clara'
        },
        {
            'id': 'echo',
            'name': 'Echo',
            'description': 'Voz masculina'
        },
        {
            'id': 'fable',
            'name': 'Fable',
            'description': 'Voz feminina suave'
        },
        {
            'id': 'onyx',
            'name': 'Onyx',
            'description': 'Voz masculina profunda'
        },
        {
            'id': 'nova',
            'name': 'Nova',
            'description': 'Voz feminina natural (recomendada)'
        },
        {
            'id': 'shimmer',
            'name': 'Shimmer',
            'description': 'Voz feminina energética'
        }
    ]
    
    return jsonify(voices)

@audio_bp.route('/session/<int:session_id>/audio-settings', methods=['GET', 'PUT'])
def audio_settings(session_id):
    """Gerencia configurações de áudio da sessão"""
    session_obj = ChatSession.query.get_or_404(session_id)
    
    if request.method == 'GET':
        # Retorna configurações atuais (pode ser expandido no futuro)
        return jsonify({
            'voice': 'nova',  # Padrão
            'auto_play': True,
            'speech_enabled': True
        })
    
    elif request.method == 'PUT':
        data = request.json
        # Aqui você pode salvar preferências de áudio do usuário
        # Por enquanto, apenas retorna sucesso
        return jsonify({
            'message': 'Configurações de áudio atualizadas',
            'settings': data
        })

