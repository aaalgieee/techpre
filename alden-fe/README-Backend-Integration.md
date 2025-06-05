# Backend Integration Setup

This guide will help you connect the Alden React Native frontend to the FastAPI backend.

## Prerequisites

1. **Backend Setup**: Make sure you have the Alden FastAPI backend running
2. **Google AI Studio API Key**: Get your API key from [Google AI Studio](https://aistudio.google.com/)

## Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd ../alden-be
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # macOS/Linux
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   copy env.example .env  # Windows
   # or
   cp env.example .env    # macOS/Linux
   ```

5. **Edit `.env` file** and add your Google AI Studio API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   DATABASE_URL=sqlite:///./alden.db
   SECRET_KEY=your_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

6. **Start the backend server**:
   ```bash
   python main.py
   ```
   
   The backend should now be running at `http://localhost:8000`

## Frontend Configuration

1. **Configure API endpoint** in `config/api.ts`:
   
   For **local development** (default):
   ```typescript
   BASE_URL: 'http://localhost:8000/api'
   ```
   
   For **physical device testing**, use your computer's IP address:
   ```typescript
   BASE_URL: 'http://192.168.1.XXX:8000/api'  // Replace XXX with your IP
   ```
   
   To find your IP address:
   - **Windows**: Run `ipconfig` in Command Prompt
   - **macOS/Linux**: Run `ifconfig` in Terminal

2. **Start the frontend**:
   ```bash
   npm start
   # or
   npx expo start
   ```

## Verification

1. **Check backend health**:
   Visit `http://localhost:8000/health` in your browser. You should see:
   ```json
   {"status": "healthy"}
   ```

2. **Check API documentation**:
   Visit `http://localhost:8000/docs` to see the interactive API documentation.

3. **Test frontend connection**:
   - Open the app
   - Try creating a study session
   - Check the console for any connection errors

## Troubleshooting

### Common Issues

1. **"Unable to connect to server"**:
   - Make sure the backend is running on `http://localhost:8000`
   - Check if the API endpoint in `config/api.ts` is correct
   - For physical devices, use your computer's IP address instead of `localhost`

2. **"Network request failed"**:
   - Check your internet connection
   - Ensure your firewall isn't blocking the connection
   - Try restarting both frontend and backend

3. **"GEMINI_API_KEY not set"**:
   - Make sure you added your Google AI Studio API key to the `.env` file
   - Restart the backend server after updating the `.env` file

4. **Physical device can't connect**:
   - Make sure your phone and computer are on the same network
   - Use your computer's IP address instead of `localhost`
   - Check if your firewall allows connections on port 8000

### Getting Your Computer's IP Address

**Windows**:
```bash
ipconfig
```
Look for "IPv4 Address" under your active network connection.

**macOS/Linux**:
```bash
ifconfig
```
Look for "inet" address under your active network interface (usually `en0` or `wlan0`).

### Testing the Connection

You can test the API connection manually:

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test study sessions endpoint
curl http://localhost:8000/api/study-sessions/
```

## Features

Once connected, you'll have access to:

✅ **Real-time AI chat** with Google Gemini  
✅ **Study session tracking** with backend persistence  
✅ **Progress statistics** stored in database  
✅ **Mindful session management**  
✅ **Document upload and management**  
✅ **Cross-device data synchronization**  

## Development vs Production

### Development (Current Setup)
- Backend: `http://localhost:8000`
- SQLite database
- Local file storage
- Debug logging enabled

### Production Deployment
To deploy for production, you would:

1. **Update API endpoint** in `config/api.ts`:
   ```typescript
   BASE_URL: 'https://your-deployed-backend.com/api'
   ```

2. **Deploy backend** to a cloud service (Heroku, AWS, etc.)
3. **Use production database** (PostgreSQL recommended)
4. **Set up proper authentication**
5. **Configure CORS** for your domain
6. **Set up HTTPS**

## Support

If you encounter issues:

1. Check the console logs in both frontend and backend
2. Verify all environment variables are set correctly
3. Ensure the backend is running and accessible
4. Test API endpoints manually using the documentation at `/docs`

The backend logs will show detailed information about requests and any errors that occur. 