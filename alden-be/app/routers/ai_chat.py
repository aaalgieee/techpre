from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..schemas import (
    AidaConversation, AidaConversationCreate, AidaMessage,
    ChatRequest, ChatResponse, MessageType
)
from .. import crud
from ..services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["ai-chat"])

def get_current_user_id() -> str:
    # TODO: Replace with proper authentication
    return "default-user"

async def process_ai_response(
    db: Session,
    conversation_id: str,
    user_message: str,
    subject: Optional[str] = None,
    documents: Optional[List[str]] = None
):
    """Background task to process AI response"""
    try:
        # Generate AI response
        ai_response = await ai_service.generate_study_response(
            message=user_message,
            subject=subject,
            documents=documents
        )
        
        # Save AI response to database
        crud.create_message(db, conversation_id, ai_response, MessageType.assistant)
        
    except Exception as e:
        print(f"Error processing AI response: {e}")
        # Save fallback response
        fallback_response = "I'm sorry, I'm experiencing technical difficulties. Please try again later."
        crud.create_message(db, conversation_id, fallback_response, MessageType.assistant)

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Send a message to the AI assistant"""
    # Ensure user exists
    user = crud.get_user(db, user_id)
    if not user:
        # Create a default user for demo purposes
        from ..schemas import UserCreate
        user_create = UserCreate(email="demo@alden.app", name="Demo User")
        user = crud.create_user(db, user_create)
    
    # Get or create conversation
    conversation_id = request.conversation_id
    if not conversation_id:
        # Create new conversation
        conversation_create = AidaConversationCreate(
            title=f"Chat about {request.message[:30]}...",
            subject=None
        )
        conversation = crud.create_conversation(db, conversation_create, user_id)
        conversation_id = conversation.id
    else:
        # Verify conversation exists and belongs to user
        conversation = crud.get_conversation(db, conversation_id, user_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Save user message
    user_message = crud.create_message(db, conversation_id, request.message, MessageType.user)
    
    # Process AI response in background
    background_tasks.add_task(
        process_ai_response,
        db,
        conversation_id,
        request.message,
        conversation.subject if 'conversation' in locals() else None,
        request.documents
    )
    
    return ChatResponse(
        response="I'm thinking about your question...",
        conversation_id=conversation_id,
        message_id=user_message.id
    )

@router.get("/conversations", response_model=List[AidaConversation])
def get_conversations(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's AI conversations"""
    conversations = crud.get_conversations(db, user_id)
    
    # Load messages for each conversation
    for conversation in conversations:
        conversation.messages = crud.get_messages(db, conversation.id, user_id)
    
    return conversations

@router.post("/conversations", response_model=AidaConversation)
def create_conversation(
    conversation: AidaConversationCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Create a new AI conversation"""
    # Ensure user exists
    user = crud.get_user(db, user_id)
    if not user:
        # Create a default user for demo purposes
        from ..schemas import UserCreate
        user_create = UserCreate(email="demo@alden.app", name="Demo User")
        user = crud.create_user(db, user_create)
    
    return crud.create_conversation(db, conversation, user_id)

@router.get("/conversations/{conversation_id}", response_model=AidaConversation)
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific conversation with messages"""
    conversation = crud.get_conversation(db, conversation_id, user_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation.messages = crud.get_messages(db, conversation_id, user_id)
    return conversation

@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Delete a conversation"""
    success = crud.delete_conversation(db, conversation_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted successfully"}

@router.get("/conversations/{conversation_id}/messages", response_model=List[AidaMessage])
def get_messages(
    conversation_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get messages from a conversation"""
    return crud.get_messages(db, conversation_id, user_id)

@router.post("/flashcards")
async def generate_flashcards(
    content: str,
    subject: Optional[str] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Generate flashcards from study content"""
    try:
        flashcards = await ai_service.generate_flashcards(content, subject)
        return {"flashcards": flashcards}
    except Exception as e:
        print(f"Error generating flashcards: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate flashcards") 