from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from . import models, schemas

# User CRUD
def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(
        id=str(uuid.uuid4()),
        email=user.email,
        name=user.name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

# Study Session CRUD
def create_study_session(db: Session, session: schemas.StudySessionCreate, user_id: str) -> models.StudySession:
    db_session = models.StudySession(
        id=str(uuid.uuid4()),
        user_id=user_id,
        subject=session.subject,
        goal=session.goal,
        technique=session.technique,
        duration=session.duration,
        start_time=datetime.utcnow()
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_study_sessions(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[models.StudySession]:
    return db.query(models.StudySession).filter(
        models.StudySession.user_id == user_id
    ).order_by(desc(models.StudySession.created_at)).offset(skip).limit(limit).all()

def get_active_study_session(db: Session, user_id: str) -> Optional[models.StudySession]:
    return db.query(models.StudySession).filter(
        and_(
            models.StudySession.user_id == user_id,
            models.StudySession.completed == False
        )
    ).first()

def end_study_session(db: Session, session_id: str, user_id: str, update_data: schemas.StudySessionUpdate) -> Optional[models.StudySession]:
    db_session = db.query(models.StudySession).filter(
        and_(
            models.StudySession.id == session_id,
            models.StudySession.user_id == user_id
        )
    ).first()
    
    if db_session:
        db_session.end_time = datetime.utcnow()
        db_session.completed = True
        if update_data.focus_score is not None:
            db_session.focus_score = update_data.focus_score
        if update_data.notes is not None:
            db_session.notes = update_data.notes
        
        # Calculate actual duration
        duration_minutes = (db_session.end_time - db_session.start_time).total_seconds() / 60
        db_session.duration = int(duration_minutes)
        
        # Update user's total study time
        user = get_user(db, user_id)
        if user:
            user.total_study_time += int(duration_minutes)
        
        db.commit()
        db.refresh(db_session)
    
    return db_session

# Mindful Session CRUD
def create_mindful_session(db: Session, session: schemas.MindfulSessionCreate, user_id: str) -> models.MindfulSession:
    db_session = models.MindfulSession(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=session.title,
        category=session.category,
        duration=session.duration,
        audio_url=session.audio_url,
        description=session.description
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_mindful_sessions(db: Session, user_id: str) -> List[models.MindfulSession]:
    return db.query(models.MindfulSession).filter(
        models.MindfulSession.user_id == user_id
    ).order_by(models.MindfulSession.created_at).all()

def complete_mindful_session(db: Session, session_id: str, user_id: str, complete_data: schemas.MindfulSessionComplete) -> Optional[models.MindfulSession]:
    db_session = db.query(models.MindfulSession).filter(
        and_(
            models.MindfulSession.id == session_id,
            models.MindfulSession.user_id == user_id
        )
    ).first()
    
    if db_session:
        db_session.completed = True
        db_session.completed_at = datetime.utcnow()
        if complete_data.rating is not None:
            db_session.rating = complete_data.rating
        
        # Update user's total mindful time
        user = get_user(db, user_id)
        if user:
            user.total_mindful_time += int(db_session.duration / 60)  # Convert seconds to minutes
        
        db.commit()
        db.refresh(db_session)
    
    return db_session

# Conversation CRUD
def create_conversation(db: Session, conversation: schemas.AidaConversationCreate, user_id: str) -> models.AidaConversation:
    db_conversation = models.AidaConversation(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=conversation.title,
        subject=conversation.subject,
        last_message=datetime.utcnow()
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

def get_conversations(db: Session, user_id: str) -> List[models.AidaConversation]:
    return db.query(models.AidaConversation).filter(
        models.AidaConversation.user_id == user_id
    ).order_by(desc(models.AidaConversation.last_message)).all()

def get_conversation(db: Session, conversation_id: str, user_id: str) -> Optional[models.AidaConversation]:
    return db.query(models.AidaConversation).filter(
        and_(
            models.AidaConversation.id == conversation_id,
            models.AidaConversation.user_id == user_id
        )
    ).first()

def delete_conversation(db: Session, conversation_id: str, user_id: str) -> bool:
    db_conversation = db.query(models.AidaConversation).filter(
        and_(
            models.AidaConversation.id == conversation_id,
            models.AidaConversation.user_id == user_id
        )
    ).first()
    
    if db_conversation:
        db.delete(db_conversation)
        db.commit()
        return True
    return False

# Message CRUD
def create_message(db: Session, conversation_id: str, content: str, message_type: schemas.MessageType) -> models.AidaMessage:
    db_message = models.AidaMessage(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        type=message_type,
        content=content
    )
    db.add(db_message)
    
    # Update conversation last_message timestamp
    db.query(models.AidaConversation).filter(
        models.AidaConversation.id == conversation_id
    ).update({"last_message": datetime.utcnow()})
    
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages(db: Session, conversation_id: str, user_id: str) -> List[models.AidaMessage]:
    # Verify user owns the conversation
    conversation = get_conversation(db, conversation_id, user_id)
    if not conversation:
        return []
    
    return db.query(models.AidaMessage).filter(
        models.AidaMessage.conversation_id == conversation_id
    ).order_by(models.AidaMessage.timestamp).all()

# Document CRUD
def create_document(db: Session, document: schemas.UploadedDocumentCreate, user_id: str) -> models.UploadedDocument:
    db_document = models.UploadedDocument(
        id=str(uuid.uuid4()),
        user_id=user_id,
        name=document.name,
        type=document.type,
        uri=document.uri,
        size=document.size
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def get_documents(db: Session, user_id: str) -> List[models.UploadedDocument]:
    return db.query(models.UploadedDocument).filter(
        models.UploadedDocument.user_id == user_id
    ).order_by(desc(models.UploadedDocument.upload_date)).all()

def delete_document(db: Session, document_id: str, user_id: str) -> bool:
    db_document = db.query(models.UploadedDocument).filter(
        and_(
            models.UploadedDocument.id == document_id,
            models.UploadedDocument.user_id == user_id
        )
    ).first()
    
    if db_document:
        db.delete(db_document)
        db.commit()
        return True
    return False

# Progress and Stats
def get_user_progress(db: Session, user_id: str) -> dict:
    user = get_user(db, user_id)
    if not user:
        return {}
    
    today = datetime.utcnow().date()
    
    # Today's study time
    today_sessions = db.query(models.StudySession).filter(
        and_(
            models.StudySession.user_id == user_id,
            func.date(models.StudySession.start_time) == today,
            models.StudySession.completed == True
        )
    ).all()
    
    today_study_time = sum(session.duration for session in today_sessions)
    sessions_today = len(today_sessions)
    
    # Completed mindful sessions
    mindful_completed = db.query(models.MindfulSession).filter(
        and_(
            models.MindfulSession.user_id == user_id,
            models.MindfulSession.completed == True
        )
    ).count()
    
    return {
        "daily_goal": user.daily_goal,
        "today_study_time": today_study_time,
        "current_streak": user.current_streak,
        "total_study_time": user.total_study_time,
        "total_mindful_time": user.total_mindful_time,
        "sessions_today": sessions_today,
        "mindful_sessions_completed": mindful_completed
    } 