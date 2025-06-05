from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import shutil

from ..database import get_db
from ..schemas import UploadedDocument, UploadedDocumentCreate
from .. import crud

router = APIRouter(prefix="/documents", tags=["documents"])

def get_current_user_id() -> str:
    # TODO: Replace with proper authentication
    return "default-user"

# Create uploads directory if it doesn't exist
UPLOAD_DIRECTORY = "uploads"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@router.post("/upload", response_model=UploadedDocument)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Upload a document"""
    # Ensure user exists
    user = crud.get_user(db, user_id)
    if not user:
        # Create a default user for demo purposes
        from ..schemas import UserCreate
        user_create = UserCreate(email="demo@alden.app", name="Demo User")
        user = crud.create_user(db, user_create)
    
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "text/plain"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="File type not supported. Please upload PDF, image, or text files."
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIRECTORY, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Determine document type
    doc_type = "pdf" if file.content_type == "application/pdf" else \
               "image" if file.content_type.startswith("image/") else \
               "text"
    
    # Create document record
    document_create = UploadedDocumentCreate(
        name=file.filename,
        type=doc_type,
        uri=file_path,
        size=file.size
    )
    
    return crud.create_document(db, document_create, user_id)

@router.get("/", response_model=List[UploadedDocument])
def get_documents(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's uploaded documents"""
    return crud.get_documents(db, user_id)

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Delete a document"""
    # Get document to find file path
    documents = crud.get_documents(db, user_id)
    document = next((doc for doc in documents if doc.id == document_id), None)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete file from filesystem
    try:
        if os.path.exists(document.uri):
            os.remove(document.uri)
    except Exception as e:
        print(f"Warning: Failed to delete file {document.uri}: {e}")
    
    # Delete from database
    success = crud.delete_document(db, document_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {"message": "Document deleted successfully"}

@router.get("/{document_id}/content")
def get_document_content(
    document_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get document content for AI processing"""
    # Get document
    documents = crud.get_documents(db, user_id)
    document = next((doc for doc in documents if doc.id == document_id), None)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Read file content based on type
    try:
        if document.type == "text":
            with open(document.uri, "r", encoding="utf-8") as f:
                content = f.read()
            return {"content": content, "type": "text"}
        elif document.type == "pdf":
            # For PDF, you might want to use PyPDF2 or similar library
            # For now, return a placeholder
            return {"content": "PDF content extraction not implemented yet", "type": "pdf"}
        elif document.type == "image":
            # For images, you might want to use OCR
            # For now, return a placeholder
            return {"content": "Image OCR not implemented yet", "type": "image"}
        else:
            raise HTTPException(status_code=400, detail="Unsupported document type")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read document: {str(e)}")