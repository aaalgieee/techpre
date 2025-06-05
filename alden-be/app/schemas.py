from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class StudyTechnique(str, Enum):
    pomodoro = "pomodoro"
    deep_work = "deep_work"
    active_recall = "active_recall"

class MindfulCategory(str, Enum):
    quick_relief = "quick_relief"
    pre_study = "pre_study"
    post_study = "post_study"
    exam_support = "exam_support"

class DocumentType(str, Enum):
    pdf = "pdf"
    image = "image"
    text = "text"

class MessageType(str, Enum):
    user = "user"
    assistant = "assistant"

# Base schemas
class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: str
    created_at: datetime
    daily_goal: int
    current_streak: int
    total_study_time: int
    total_mindful_time: int
    
    class Config:
        from_attributes = True

# Study Session schemas
class StudySessionBase(BaseModel):
    subject: str
    goal: str
    technique: StudyTechnique
    duration: int

class StudySessionCreate(StudySessionBase):
    pass

class StudySessionUpdate(BaseModel):
    focus_score: Optional[int] = None
    notes: Optional[str] = None

class StudySession(StudySessionBase):
    id: str
    user_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    completed: bool
    focus_score: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Mindful Session schemas
class MindfulSessionBase(BaseModel):
    title: str
    category: MindfulCategory
    duration: int
    audio_url: str
    description: str

class MindfulSessionCreate(MindfulSessionBase):
    pass

class MindfulSessionComplete(BaseModel):
    rating: Optional[int] = None

class MindfulSession(MindfulSessionBase):
    id: str
    user_id: str
    completed: bool
    completed_at: Optional[datetime] = None
    rating: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Message schemas
class AidaMessageBase(BaseModel):
    content: str

class AidaMessageCreate(AidaMessageBase):
    conversation_id: str

class AidaMessage(AidaMessageBase):
    id: str
    conversation_id: str
    type: MessageType
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Conversation schemas
class AidaConversationBase(BaseModel):
    title: str
    subject: Optional[str] = None

class AidaConversationCreate(AidaConversationBase):
    pass

class AidaConversation(AidaConversationBase):
    id: str
    user_id: str
    last_message: datetime
    created_at: datetime
    messages: List[AidaMessage] = []
    
    class Config:
        from_attributes = True

# Document schemas
class UploadedDocumentBase(BaseModel):
    name: str
    type: DocumentType

class UploadedDocumentCreate(UploadedDocumentBase):
    uri: str
    size: Optional[int] = None

class UploadedDocument(UploadedDocumentBase):
    id: str
    user_id: str
    uri: str
    size: Optional[int] = None
    upload_date: datetime
    
    class Config:
        from_attributes = True

# AI Chat schemas
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    documents: Optional[List[str]] = None  # List of document IDs

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    message_id: str

# Progress schemas
class UserProgress(BaseModel):
    daily_goal: int
    today_study_time: int
    current_streak: int
    total_study_time: int
    total_mindful_time: int
    sessions_today: int
    mindful_sessions_completed: int 