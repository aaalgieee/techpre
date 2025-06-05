from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import StudySession, StudySessionCreate, StudySessionUpdate
from .. import crud

router = APIRouter(prefix="/study-sessions", tags=["study-sessions"])

# For now, we'll use a simple user_id header until auth is implemented
def get_current_user_id() -> str:
    # TODO: Replace with proper authentication
    return "default-user"

@router.post("/", response_model=StudySession)
def create_study_session(
    session: StudySessionCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Start a new study session"""
    # Check if user has an active session
    active_session = crud.get_active_study_session(db, user_id)
    if active_session:
        raise HTTPException(
            status_code=400,
            detail="You already have an active study session. End it before starting a new one."
        )
    
    # Ensure user exists
    user = crud.get_user(db, user_id)
    if not user:
        # Create a default user for demo purposes
        from ..schemas import UserCreate
        user_create = UserCreate(email="demo@alden.app", name="Demo User")
        user = crud.create_user(db, user_create)
    
    return crud.create_study_session(db, session, user_id)

@router.get("/", response_model=List[StudySession])
def get_study_sessions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's study sessions"""
    return crud.get_study_sessions(db, user_id, skip, limit)

@router.get("/active", response_model=StudySession)
def get_active_session(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get the current active study session"""
    session = crud.get_active_study_session(db, user_id)
    if not session:
        raise HTTPException(status_code=404, detail="No active study session found")
    return session

@router.put("/{session_id}/end", response_model=StudySession)
def end_study_session(
    session_id: str,
    update_data: StudySessionUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """End a study session"""
    session = crud.end_study_session(db, session_id, user_id, update_data)
    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")
    return session 