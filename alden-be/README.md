# Alden Backend

A FastAPI backend for Alden - Study Assistant with AI, featuring Google Gemini AI integration, SQLite database, and comprehensive study tracking.

## Features

- **Study Sessions**: Track and manage study sessions with different techniques (Pomodoro, Deep Work, Active Recall)
- **Mindful Sessions**: Meditation and mindfulness sessions for study preparation and stress relief
- **AI Chat Assistant (Aida)**: Powered by Google Gemini AI for study assistance
- **Document Management**: Upload and manage study documents
- **Progress Tracking**: User progress, streaks, and statistics
- **RESTful API**: Full CRUD operations with proper validation

## Tech Stack

- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Lightweight database
- **Google Gemini AI**: AI-powered study assistant
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI server

## Setup

### Prerequisites

- Python 3.8+
- Google AI Studio API key (for Gemini integration)

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd alden-be
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file and add your Google AI Studio API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   DATABASE_URL=sqlite:///./alden.db
   SECRET_KEY=your_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

### Getting Google AI Studio API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key to your `.env` file

### Running the Application

1. **Start the server**:
   ```bash
   python main.py
   ```
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Access the API**:
   - API Base URL: `http://localhost:8000`
   - Interactive API Docs: `http://localhost:8000/docs`
   - Alternative API Docs: `http://localhost:8000/redoc`

## API Endpoints

### Study Sessions
- `POST /api/study-sessions/` - Start a new study session
- `GET /api/study-sessions/` - Get user's study sessions
- `GET /api/study-sessions/active` - Get active study session
- `PUT /api/study-sessions/{session_id}/end` - End a study session

### Mindful Sessions
- `POST /api/mindful-sessions/` - Create a mindful session
- `GET /api/mindful-sessions/` - Get user's mindful sessions
- `PUT /api/mindful-sessions/{session_id}/complete` - Complete a mindful session
- `GET /api/mindful-sessions/prebuilt` - Get prebuilt mindful sessions

### AI Chat (Aida)
- `POST /api/ai/chat` - Send message to AI assistant
- `GET /api/ai/conversations` - Get user's conversations
- `POST /api/ai/conversations` - Create new conversation
- `GET /api/ai/conversations/{conversation_id}` - Get specific conversation
- `DELETE /api/ai/conversations/{conversation_id}` - Delete conversation
- `POST /api/ai/flashcards` - Generate flashcards from content

### Documents
- `POST /api/documents/upload` - Upload a document
- `GET /api/documents/` - Get user's documents
- `DELETE /api/documents/{document_id}` - Delete a document
- `GET /api/documents/{document_id}/content` - Get document content

### Progress & User
- `GET /api/progress/` - Get user progress and statistics
- `GET /api/progress/user` - Get user profile
- `PUT /api/progress/daily-goal` - Update daily study goal
- `POST /api/progress/streak/update` - Update user streak

## Data Models

### Study Session
```json
{
  "subject": "Mathematics",
  "goal": "Complete calculus homework",
  "technique": "pomodoro",
  "duration": 25
}
```

### Mindful Session
```json
{
  "title": "Focus Boost",
  "category": "pre_study",
  "duration": 240,
  "audio_url": "/audio/focus-boost.mp3",
  "description": "A 4-minute meditation to prepare your mind"
}
```

### AI Chat Request
```json
{
  "message": "Can you help me understand calculus derivatives?",
  "conversation_id": "optional-conversation-id",
  "documents": ["optional-document-ids"]
}
```

## Development

### Project Structure
```
alden-be/
├── app/
│   ├── __init__.py
│   ├── config.py           # Configuration settings
│   ├── database.py         # Database setup
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── crud.py             # Database operations
│   ├── services/
│   │   ├── __init__.py
│   │   └── ai_service.py   # Google Gemini AI integration
│   └── routers/
│       ├── __init__.py
│       ├── study_sessions.py
│       ├── mindful_sessions.py
│       ├── ai_chat.py
│       ├── documents.py
│       └── progress.py
├── uploads/                # Document uploads directory
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── env.example            # Environment variables example
└── README.md              # This file
```

### Adding New Features

1. **Database Models**: Add new models in `app/models.py`
2. **Schemas**: Define request/response schemas in `app/schemas.py`
3. **CRUD Operations**: Add database operations in `app/crud.py`
4. **API Routes**: Create new router files in `app/routers/`
5. **Services**: Add business logic in `app/services/`

### Database Migrations

The app automatically creates tables on startup. For production, consider using Alembic for database migrations.

## AI Integration

The backend uses Google Gemini AI for:
- Study assistance and tutoring
- Generating flashcards from content
- Answering academic questions
- Providing study strategies

The AI service includes fallback responses when the Gemini API is unavailable.

## Authentication

Currently using a simple "default-user" system for demo purposes. For production:
- Implement proper JWT authentication
- Add user registration/login endpoints
- Secure all routes with authentication middleware

## File Uploads

- Supported formats: PDF, images (JPEG, PNG), text files
- Files are stored in the `uploads/` directory
- File metadata is stored in the database

## Error Handling

The API includes comprehensive error handling:
- 400: Bad Request (validation errors)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error (server issues)

## Testing

To test the API:
1. Start the server
2. Visit `http://localhost:8000/docs` for interactive testing
3. Use the provided examples in the API documentation

## Deployment

For production deployment:
1. Set secure environment variables
2. Use a production ASGI server like Gunicorn
3. Set up proper database (PostgreSQL recommended)
4. Configure proper CORS origins
5. Add authentication and authorization
6. Set up logging and monitoring

## Contributing

1. Follow PEP 8 style guidelines
2. Add proper type hints
3. Write docstrings for functions
4. Test new features thoroughly
5. Update this README for new features

## License

This project is part of the Alden study assistant application. 