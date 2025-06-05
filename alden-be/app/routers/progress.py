from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import UserProgress, User
from .. import crud

router = APIRouter(prefix="/progress", tags=["progress"])

def get_current_user_id() -> str:
    # TODO: Replace with proper authentication
    return "default-user"

@router.get("/", response_model=UserProgress)
def get_user_progress(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's progress and statistics"""
    progress = crud.get_user_progress(db, user_id)
    if not progress:
        raise HTTPException(status_code=404, detail="User not found")
    return progress

@router.get("/user", response_model=User)
def get_user_profile(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get user profile information"""
    user = crud.get_user(db, user_id)
    if not user:
        # Create a default user for demo purposes
        from ..schemas import UserCreate
        user_create = UserCreate(email="demo@alden.app", name="Demo User")
        user = crud.create_user(db, user_create)
    return user

@router.put("/daily-goal")
def update_daily_goal(
    goal_minutes: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Update user's daily study goal"""
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.daily_goal = goal_minutes
    db.commit()
    db.refresh(user)
    
    return {"message": "Daily goal updated successfully", "new_goal": goal_minutes}

@router.post("/streak/update")
def update_streak(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Update user's current streak based on today's activity"""
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get today's progress
    progress = crud.get_user_progress(db, user_id)
    
    # Update streak if daily goal is met
    if progress["today_study_time"] >= user.daily_goal:
        user.current_streak += 1
    else:
        user.current_streak = 0
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": "Streak updated",
        "current_streak": user.current_streak,
        "goal_met": progress["today_study_time"] >= user.daily_goal
    } 