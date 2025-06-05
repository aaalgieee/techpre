from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import MindfulSession, MindfulSessionCreate, MindfulSessionComplete
from .. import crud

router = APIRouter(prefix="/mindful-sessions", tags=["mindful-sessions"])

def get_current_user_id() -> str:
    # TODO: Replace with proper authentication
    return "default-user"

@router.post("/", response_model=MindfulSession)
def create_mindful_session(
    session: MindfulSessionCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Create a new mindful session"""
    # Ensure user exists
    user = crud.get_user(db, user_id)
    if not user:
        # Create a default user for demo purposes
        from ..schemas import UserCreate
        user_create = UserCreate(email="demo@alden.app", name="Demo User")
        user = crud.create_user(db, user_create)
    
    return crud.create_mindful_session(db, session, user_id)

@router.get("/", response_model=List[MindfulSession])
def get_mindful_sessions(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's mindful sessions"""
    return crud.get_mindful_sessions(db, user_id)

@router.put("/{session_id}/complete", response_model=MindfulSession)
def complete_mindful_session(
    session_id: str,
    complete_data: MindfulSessionComplete,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Mark a mindful session as completed"""
    session = crud.complete_mindful_session(db, session_id, user_id, complete_data)
    if not session:
        raise HTTPException(status_code=404, detail="Mindful session not found")
    return session

@router.get("/prebuilt")
def get_prebuilt_sessions():
    """Get prebuilt mindful sessions"""
    return [
        {
            "id": "focus-boost",
            "title": "Focus Boost",
            "category": "pre_study",
            "duration": 240,
            "audio_url": "/audio/focus-boost.mp3",
            "description": "A 4-minute meditation to prepare your mind for focused study",
        },
        {
            "id": "sos-breathing",
            "title": "SOS Breathing",
            "category": "quick_relief",
            "duration": 60,
            "audio_url": "/audio/sos-breathing.mp3",
            "description": "Quick breathing exercise for immediate stress relief",
        },
        {
            "id": "study-reflection",
            "title": "Study Reflection",
            "category": "post_study",
            "duration": 420,
            "audio_url": "/audio/study-reflection.mp3",
            "description": "Wind down and reflect on your study session",
        },
        {
            "id": "pre-exam-calm",
            "title": "Pre-Exam Calm",
            "category": "exam_support",
            "duration": 600,
            "audio_url": "/audio/pre-exam-calm.mp3",
            "description": "Calm your nerves before an important exam",
        },
    ] 