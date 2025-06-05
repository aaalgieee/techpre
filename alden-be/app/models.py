from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class StudyTechnique(enum.Enum):
    pomodoro = "pomodoro"
    deep_work = "deep_work"
    active_recall = "active_recall"

class MindfulCategory(enum.Enum):
    quick_relief = "quick_relief"
    pre_study = "pre_study"
    post_study = "post_study"
    exam_support = "exam_support"

class DocumentType(enum.Enum):
    pdf = "pdf"
    image = "image"
    text = "text"

class MessageType(enum.Enum):
    user = "user"
    assistant = "assistant"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # User settings
    daily_goal = Column(Integer, default=120)  # minutes
    current_streak = Column(Integer, default=0)
    total_study_time = Column(Integer, default=0)  # minutes
    total_mindful_time = Column(Integer, default=0)  # minutes
    
    # Relationships
    study_sessions = relationship("StudySession", back_populates="user")
    mindful_sessions = relationship("MindfulSession", back_populates="user")
    conversations = relationship("AidaConversation", back_populates="user")
    documents = relationship("UploadedDocument", back_populates="user")

class StudySession(Base):
    __tablename__ = "study_sessions"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    subject = Column(String)
    goal = Column(Text)
    technique = Column(Enum(StudyTechnique))
    duration = Column(Integer)  # in minutes
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True), nullable=True)
    completed = Column(Boolean, default=False)
    focus_score = Column(Integer, nullable=True)  # 1-10
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="study_sessions")

class MindfulSession(Base):
    __tablename__ = "mindful_sessions"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    category = Column(Enum(MindfulCategory))
    duration = Column(Integer)  # in seconds
    audio_url = Column(String)
    description = Column(Text)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    rating = Column(Integer, nullable=True)  # 1-5
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="mindful_sessions")

class AidaConversation(Base):
    __tablename__ = "aida_conversations"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    subject = Column(String, nullable=True)
    last_message = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("AidaMessage", back_populates="conversation", cascade="all, delete-orphan")

class AidaMessage(Base):
    __tablename__ = "aida_messages"
    
    id = Column(String, primary_key=True, index=True)
    conversation_id = Column(String, ForeignKey("aida_conversations.id"))
    type = Column(Enum(MessageType))
    content = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    conversation = relationship("AidaConversation", back_populates="messages")

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    name = Column(String)
    type = Column(Enum(DocumentType))
    uri = Column(String)
    size = Column(Integer, nullable=True)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="documents")