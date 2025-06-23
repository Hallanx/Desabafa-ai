from flask import Blueprint, jsonify, request
import openai
import os
from src.models.user import ChatMessage, ChatSession, User, db
from datetime import datetime

ai_bp = Blueprint('ai', __name__)

# Configuração CORS
@ai_bp.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Configurar OpenAI API Key
openai.api_key = os.getenv('OPENAI_API_KEY')

# Prompts para diferentes perfis de terapeuta
THERAPIST_PROMPTS = {
    'psicologo': {
        'system_prompt': """Você é uma psicóloga empática e acolhedora especializada em escuta ativa. 
        Seu nome é Ana e você tem uma abordagem humanística baseada em Carl Rogers.
        
        Diretrizes:
        - Sempre demonstre empatia genuína e validação emocional
        - Use linguagem acolhedora e não julgamental
        - Faça perguntas abertas para ajudar a pessoa a se expressar
        - Ofereça insights psicológicos quando apropriado
        - Mantenha um tom caloroso mas profissional
        - Responda em português brasileiro
        - Suas respostas devem ter entre 50-150 palavras
        - Termine sempre oferecendo apoio contínuo""",
        'greeting': "Olá! Eu sou a Ana, sua psicóloga virtual. Estou aqui para te escutar sem julgamentos. O que está pesando no seu coração hoje?"
    },
    'coach': {
        'system_prompt': """Você é um coach de vida motivacional e inspirador.
        Seu nome é Carlos e você tem uma abordagem focada em soluções e crescimento pessoal.
        
        Diretrizes:
        - Seja motivador e encorajador
        - Foque em soluções práticas e ações concretas
        - Ajude a pessoa a identificar seus pontos fortes
        - Ofereça estratégias para superar desafios
        - Use linguagem positiva e energizante
        - Responda em português brasileiro
        - Suas respostas devem ter entre 50-150 palavras
        - Termine sempre com uma pergunta ou desafio construtivo""",
        'greeting': "E aí! Eu sou o Carlos, seu coach pessoal. Estou aqui para te ajudar a transformar desafios em oportunidades. Vamos descobrir juntos o seu potencial?"
    },
    'conselheiro_espiritual': {
        'system_prompt': """Você é uma conselheira espiritual sábia e compassiva.
        Seu nome é Luz e você oferece orientação baseada em sabedoria universal e amor incondicional.
        
        Diretrizes:
        - Seja compassiva e amorosa
        - Ofereça perspectivas espirituais sem ser religiosa específica
        - Foque na conexão interior e propósito de vida
        - Use linguagem suave e reconfortante
        - Ajude a encontrar significado nas experiências
        - Responda em português brasileiro
        - Suas respostas devem ter entre 50-150 palavras
        - Termine sempre com uma reflexão ou afirmação positiva""",
        'greeting': "Namastê! Eu sou a Luz, sua guia espiritual. Estou aqui para te acompanhar nesta jornada de autoconhecimento. Que luz posso ajudar a despertar em você hoje?"
    }
}

@ai_bp.route('/chat', methods=['POST'])
def chat_with_ai():
    """Gera resposta da IA terapeuta"""
    try:
        data = request.json
        
        if not data.get('session_id') or not data.get('message'):
            return jsonify({'error': 'session_id e message são obrigatórios'}), 400
        
        session_id = data['session_id']
        user_message = data['message']
        generate_audio = data.get('generate_audio', False)
        voice = data.get('voice', 'nova')
        
        # Busca a sessão
        session_obj = ChatSession.query.get_or_404(session_id)
        user = User.query.get_or_404(session_obj.user_id)
        
        # Verifica se o usuário pode continuar a conversa
        if not user.subscription_active and user.free_sessions_remaining <= 0:
            return jsonify({'error': 'Sessões gratuitas esgotadas. Faça upgrade para continuar.'}), 403
        
        # Obtém o perfil do terapeuta
        therapist_profile = session_obj.therapist_profile
        if therapist_profile not in THERAPIST_PROMPTS:
            therapist_profile = 'psicologo'  # Padrão
        
        prompt_config = THERAPIST_PROMPTS[therapist_profile]
        
        # Busca histórico da conversa
        messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.timestamp).all()
        
        # Monta o contexto da conversa para o GPT
        conversation = [
            {"role": "system", "content": prompt_config['system_prompt']}
        ]
        
        # Se é a primeira mensagem, adiciona a saudação
        if not messages:
            conversation.append({"role": "assistant", "content": prompt_config['greeting']})
        
        # Adiciona histórico da conversa (últimas 10 mensagens para não exceder limite)
        for msg in messages[-10:]:
            role = "user" if msg.sender == "user" else "assistant"
            conversation.append({"role": role, "content": msg.message})
        
        # Adiciona a nova mensagem do usuário
        conversation.append({"role": "user", "content": user_message})
        
        # Gera resposta com OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=conversation,
            max_tokens=200,
            temperature=0.8,
            presence_penalty=0.1,
            frequency_penalty=0.1
        )
        
        ai_response = response.choices[0].message.content
        tokens_used = response.usage.total_tokens
        
        # Salva a resposta da IA no banco
        ai_message = ChatMessage(
            session_id=session_id,
            sender='ai',
            message=ai_response,
            tokens_used=tokens_used,
            voice_used=voice if generate_audio else None
        )
        
        db.session.add(ai_message)
        session_obj.updated_at = datetime.utcnow()
        db.session.commit()
        
        response_data = {
            'message': ai_response,
            'message_id': ai_message.id,
            'tokens_used': tokens_used,
            'timestamp': ai_message.timestamp.isoformat(),
            'therapist_profile': therapist_profile
        }
        
        # Gera áudio se solicitado
        if generate_audio:
            try:
                audio_response = openai.Audio.speech.create(
                    model="tts-1",
                    voice=voice,
                    input=ai_response,
                    speed=1.0
                )
                
                # Salva o arquivo de áudio
                import tempfile
                import uuid
                
                audio_filename = f"ai_response_{uuid.uuid4().hex[:8]}.mp3"
                audio_path = os.path.join(tempfile.gettempdir(), audio_filename)
                
                with open(audio_path, 'wb') as audio_file:
                    for chunk in audio_response.iter_bytes():
                        audio_file.write(chunk)
                
                # Atualiza a mensagem com informações de áudio
                ai_message.has_audio = True
                ai_message.audio_url = f'/api/audio/download/{audio_filename}'
                db.session.commit()
                
                response_data['has_audio'] = True
                response_data['audio_url'] = ai_message.audio_url
                
            except Exception as audio_error:
                print(f"Erro ao gerar áudio: {audio_error}")
                # Continua sem áudio se houver erro
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao gerar resposta: {str(e)}'}), 500

@ai_bp.route('/therapist-profiles', methods=['GET'])
def get_therapist_profiles():
    """Retorna os perfis de terapeuta disponíveis"""
    profiles = []
    
    for profile_id, config in THERAPIST_PROMPTS.items():
        profiles.append({
            'id': profile_id,
            'name': profile_id.replace('_', ' ').title(),
            'greeting': config['greeting'],
            'description': config['system_prompt'].split('\n')[0].replace('Você é ', '')
        })
    
    return jsonify(profiles)

@ai_bp.route('/session/<int:session_id>/summary', methods=['POST'])
def generate_session_summary():
    """Gera um resumo automático da sessão usando IA"""
    try:
        session_id = request.json.get('session_id')
        session_obj = ChatSession.query.get_or_404(session_id)
        
        # Busca todas as mensagens da sessão
        messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.timestamp).all()
        
        if not messages:
            return jsonify({'error': 'Sessão sem mensagens para resumir'}), 400
        
        # Monta o texto da conversa
        conversation_text = ""
        for msg in messages:
            sender_name = "Usuário" if msg.sender == "user" else "Terapeuta"
            conversation_text += f"{sender_name}: {msg.message}\n"
        
        # Prompt para gerar resumo
        summary_prompt = f"""
        Analise esta sessão de terapia e crie um resumo profissional e empático:

        {conversation_text}

        Crie um resumo que inclua:
        1. Principais temas abordados
        2. Estado emocional do usuário
        3. Insights importantes
        4. Progresso observado
        5. Sugestões para próximas sessões

        Mantenha um tom profissional, empático e confidencial.
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": summary_prompt}],
            max_tokens=300,
            temperature=0.3
        )
        
        summary = response.choices[0].message.content
        
        # Salva o resumo na sessão
        session_obj.summary = summary
        db.session.commit()
        
        return jsonify({
            'summary': summary,
            'session_id': session_id,
            'generated_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao gerar resumo: {str(e)}'}), 500

