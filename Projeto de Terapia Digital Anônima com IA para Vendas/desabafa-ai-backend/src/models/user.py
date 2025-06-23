from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    is_anonymous = db.Column(db.Boolean, default=False)
    free_sessions_remaining = db.Column(db.Integer, default=3)
    subscription_plan = db.Column(db.String(50), default='free')  # free, premium
    subscription_active = db.Column(db.Boolean, default=False)
    subscription_expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relacionamentos
    sessions = db.relationship('ChatSession', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'is_anonymous': self.is_anonymous,
            'free_sessions_remaining': self.free_sessions_remaining,
            'subscription_plan': self.subscription_plan,
            'subscription_active': self.subscription_active,
            'subscription_expires_at': self.subscription_expires_at.isoformat() if self.subscription_expires_at else None,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

    def can_start_session(self):
        """Verifica se o usuário pode iniciar uma nova sessão"""
        if self.subscription_active:
            return True
        return self.free_sessions_remaining > 0

    def use_free_session(self):
        """Usa uma sessão gratuita"""
        if self.free_sessions_remaining > 0:
            self.free_sessions_remaining -= 1
            return True
        return False

class ChatSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    session_type = db.Column(db.String(50), nullable=False)  # apoio_emocional, estresse, etc.
    therapist_profile = db.Column(db.String(50), nullable=False)  # ana, carlos, luz
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relacionamentos
    messages = db.relationship('ChatMessage', backref='session', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_type': self.session_type,
            'therapist_profile': self.therapist_profile,
            'created_at': self.created_at.isoformat(),
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'is_active': self.is_active,
            'message_count': len(self.messages)
        }

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_session.id'), nullable=False)
    sender = db.Column(db.String(20), nullable=False)  # 'user' ou 'ai'
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='text')  # text, audio
    audio_url = db.Column(db.String(255), nullable=True)  # URL do arquivo de áudio
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'sender': self.sender,
            'content': self.content,
            'message_type': self.message_type,
            'audio_url': self.audio_url,
            'created_at': self.created_at.isoformat()
        }

