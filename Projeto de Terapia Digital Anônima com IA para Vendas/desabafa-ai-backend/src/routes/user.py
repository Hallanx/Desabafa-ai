from flask import Blueprint, jsonify, request, session
from werkzeug.security import generate_password_hash, check_password_hash
from src.models.user import User, ChatSession, ChatMessage, db
from datetime import datetime
import uuid

user_bp = Blueprint('user', __name__)

# Configuração CORS
@user_bp.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Rota para criar usuário anônimo
@user_bp.route('/anonymous-user', methods=['POST'])
def create_anonymous_user():
    """Cria um usuário anônimo para sessões gratuitas"""
    anonymous_email = f"anonymous_{uuid.uuid4().hex[:8]}@desabafa.ai"
    
    user = User(
        email=anonymous_email,
        is_anonymous=True,
        free_sessions_remaining=3
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'user_id': user.id,
        'anonymous_token': user.email,
        'free_sessions_remaining': user.free_sessions_remaining
    }), 201

# Rota para registro de usuário
@user_bp.route('/register', methods=['POST'])
def register():
    """Registra um novo usuário com email e senha"""
    data = request.json
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400
    
    # Verifica se o usuário já existe
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'Email já cadastrado'}), 400
    
    # Cria novo usuário
    user = User(
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        is_anonymous=False,
        free_sessions_remaining=3
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'user_id': user.id,
        'email': user.email,
        'free_sessions_remaining': user.free_sessions_remaining
    }), 201

# Rota para login
@user_bp.route('/login', methods=['POST'])
def login():
    """Faz login do usuário"""
    data = request.json
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Credenciais inválidas'}), 401
    
    # Atualiza último login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'user_id': user.id,
        'email': user.email,
        'subscription_plan': user.subscription_plan,
        'subscription_active': user.subscription_active,
        'free_sessions_remaining': user.free_sessions_remaining
    }), 200

# Rota para verificar status do usuário
@user_bp.route('/user/<int:user_id>/status', methods=['GET'])
def get_user_status(user_id):
    """Retorna o status atual do usuário"""
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

# Rota para criar nova sessão de chat
@user_bp.route('/sessions', methods=['POST'])
def create_session():
    """Cria uma nova sessão de chat"""
    data = request.json
    
    if not data.get('user_id') or not data.get('session_type') or not data.get('therapist_profile'):
        return jsonify({'error': 'user_id, session_type e therapist_profile são obrigatórios'}), 400
    
    user = User.query.get_or_404(data['user_id'])
    
    # Verifica se o usuário pode iniciar uma nova sessão
    if not user.can_start_session():
        return jsonify({'error': 'Sessões gratuitas esgotadas. Faça upgrade para continuar.'}), 403
    
    # Cria nova sessão
    session_obj = ChatSession(
        user_id=user.id,
        session_type=data['session_type'],
        therapist_profile=data['therapist_profile'],
        is_premium=data.get('is_premium', False)
    )
    
    db.session.add(session_obj)
    
    # Se não é premium, usa uma sessão gratuita
    if not data.get('is_premium', False) and not user.subscription_active:
        user.use_free_session()
    
    db.session.commit()
    
    return jsonify(session_obj.to_dict()), 201

# Rota para listar sessões do usuário
@user_bp.route('/user/<int:user_id>/sessions', methods=['GET'])
def get_user_sessions(user_id):
    """Lista todas as sessões do usuário"""
    user = User.query.get_or_404(user_id)
    sessions = ChatSession.query.filter_by(user_id=user_id).order_by(ChatSession.created_at.desc()).all()
    
    return jsonify([session.to_dict() for session in sessions])

# Rota para obter detalhes de uma sessão específica
@user_bp.route('/sessions/<int:session_id>', methods=['GET'])
def get_session(session_id):
    """Retorna detalhes de uma sessão específica com suas mensagens"""
    session_obj = ChatSession.query.get_or_404(session_id)
    
    session_data = session_obj.to_dict()
    session_data['messages'] = [message.to_dict() for message in session_obj.messages]
    
    return jsonify(session_data)

# Rota para adicionar mensagem à sessão
@user_bp.route('/sessions/<int:session_id>/messages', methods=['POST'])
def add_message(session_id):
    """Adiciona uma nova mensagem à sessão"""
    data = request.json
    
    if not data.get('sender') or not data.get('message'):
        return jsonify({'error': 'sender e message são obrigatórios'}), 400
    
    session_obj = ChatSession.query.get_or_404(session_id)
    
    message = ChatMessage(
        session_id=session_id,
        sender=data['sender'],
        message=data['message'],
        tokens_used=data.get('tokens_used', 0)
    )
    
    db.session.add(message)
    
    # Atualiza timestamp da sessão
    session_obj.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify(message.to_dict()), 201

# Rota para atualizar plano de assinatura
@user_bp.route('/user/<int:user_id>/subscription', methods=['PUT'])
def update_subscription(user_id):
    """Atualiza o plano de assinatura do usuário"""
    data = request.json
    user = User.query.get_or_404(user_id)
    
    user.subscription_plan = data.get('subscription_plan', user.subscription_plan)
    user.subscription_active = data.get('subscription_active', user.subscription_active)
    
    if data.get('subscription_expires_at'):
        user.subscription_expires_at = datetime.fromisoformat(data['subscription_expires_at'])
    
    db.session.commit()
    
    return jsonify(user.to_dict())

# Rota para gerar resumo da sessão
@user_bp.route('/sessions/<int:session_id>/summary', methods=['POST'])
def generate_session_summary(session_id):
    """Gera e salva um resumo da sessão"""
    data = request.json
    session_obj = ChatSession.query.get_or_404(session_id)
    
    session_obj.summary = data.get('summary', '')
    db.session.commit()
    
    return jsonify({'message': 'Resumo salvo com sucesso', 'summary': session_obj.summary})

# Rota para estatísticas do usuário
@user_bp.route('/user/<int:user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    """Retorna estatísticas do usuário"""
    user = User.query.get_or_404(user_id)
    
    total_sessions = ChatSession.query.filter_by(user_id=user_id).count()
    total_messages = db.session.query(ChatMessage).join(ChatSession).filter(ChatSession.user_id == user_id).count()
    
    return jsonify({
        'total_sessions': total_sessions,
        'total_messages': total_messages,
        'free_sessions_remaining': user.free_sessions_remaining,
        'subscription_active': user.subscription_active,
        'member_since': user.created_at.isoformat()
    })
