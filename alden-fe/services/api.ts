// API service for connecting to Alden Backend
import { API_CONFIG, getEnvironmentConfig } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// API response types matching backend schemas
export interface APIStudySession {
  id: string;
  user_id: string;
  subject: string;
  goal: string;
  technique: 'pomodoro' | 'deep_work' | 'active_recall';
  duration: number;
  start_time: string;
  end_time?: string;
  completed: boolean;
  focus_score?: number;
  notes?: string;
  created_at: string;
}

export interface APIMindfulSession {
  id: string;
  user_id: string;
  title: string;
  category: 'quick_relief' | 'pre_study' | 'post_study' | 'exam_support';
  duration: number;
  audio_url: string;
  description: string;
  completed: boolean;
  completed_at?: string;
  rating?: number;
  created_at: string;
}

export interface APIAidaConversation {
  id: string;
  user_id: string;
  title: string;
  subject?: string;
  last_message: string;
  created_at: string;
  messages: APIAidaMessage[];
}

export interface APIAidaMessage {
  id: string;
  conversation_id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface APIUploadedDocument {
  id: string;
  user_id: string;
  name: string;
  type: 'pdf' | 'image' | 'text';
  uri: string;
  size?: number;
  upload_date: string;
}

export interface APIUserProgress {
  daily_goal: number;
  today_study_time: number;
  current_streak: number;
  total_study_time: number;
  total_mindful_time: number;
  sessions_today: number;
  mindful_sessions_completed: number;
}

// Helper function to handle API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = getEnvironmentConfig();
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: API_CONFIG.TIMEOUT,
  };

  // Merge options
  const requestOptions = { ...defaultOptions, ...options };
  
  // Merge headers
  requestOptions.headers = { ...defaultOptions.headers, ...options.headers };

  if (config.enableLogging) {
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    if (options.body) {
      console.log('Request Body:', options.body);
    }
  }

  try {
    const response = await fetch(url, requestOptions);

    if (config.enableLogging) {
      console.log(`API Response: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (config.enableLogging) {
      console.log('API Response Data:', data);
    }
    
    return data;
  } catch (error) {
    if (config.enableLogging) {
      console.error('API Error:', error);
    }
    
    // Enhance error messages for common scenarios
    if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection and ensure the backend is running.');
    }
    
    if (error.message.includes('timeout')) {
      throw new Error('Request timed out. Please try again.');
    }
    
    throw error;
  }
}

// Study Sessions API
export const studySessionsAPI = {
  async create(sessionData: {
    subject: string;
    goal: string;
    technique: 'pomodoro' | 'deep_work' | 'active_recall';
    duration: number;
  }): Promise<APIStudySession> {
    return apiRequest('/study-sessions/', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  async getAll(): Promise<APIStudySession[]> {
    return apiRequest('/study-sessions/');
  },

  async getActive(): Promise<APIStudySession | null> {
    try {
      return await apiRequest('/study-sessions/active');
    } catch (error) {
      // Return null if no active session found
      if (error.message.includes('404') || error.message.includes('No active')) {
        return null;
      }
      throw error;
    }
  },

  async endSession(sessionId: string, updateData: {
    focus_score?: number;
    notes?: string;
  }): Promise<APIStudySession> {
    return apiRequest(`/study-sessions/${sessionId}/end`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },
};

// Mindful Sessions API
export const mindfulSessionsAPI = {
  async create(sessionData: {
    title: string;
    category: 'quick_relief' | 'pre_study' | 'post_study' | 'exam_support';
    duration: number;
    audio_url: string;
    description: string;
  }): Promise<APIMindfulSession> {
    return apiRequest('/mindful-sessions/', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  async getAll(): Promise<APIMindfulSession[]> {
    return apiRequest('/mindful-sessions/');
  },

  async complete(sessionId: string, rating?: number): Promise<APIMindfulSession> {
    return apiRequest(`/mindful-sessions/${sessionId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ rating }),
    });
  },

  async getPrebuilt(): Promise<any[]> {
    return apiRequest('/mindful-sessions/prebuilt');
  },
};

// AI Chat API
export const aiChatAPI = {
  async sendMessage(message: string, conversationId?: string, documents?: string[]): Promise<{
    response: string;
    conversation_id: string;
    message_id: string;
  }> {
    return apiRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        documents,
      }),
    });
  },

  async getConversations(): Promise<APIAidaConversation[]> {
    return apiRequest('/ai/conversations');
  },

  async createConversation(title: string, subject?: string): Promise<APIAidaConversation> {
    return apiRequest('/ai/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, subject }),
    });
  },

  async getConversation(conversationId: string): Promise<APIAidaConversation> {
    return apiRequest(`/ai/conversations/${conversationId}`);
  },

  async deleteConversation(conversationId: string): Promise<{ message: string }> {
    return apiRequest(`/ai/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  },

  async getMessages(conversationId: string): Promise<APIAidaMessage[]> {
    return apiRequest(`/ai/conversations/${conversationId}/messages`);
  },

  async generateFlashcards(content: string, subject?: string): Promise<{ flashcards: any[] }> {
    return apiRequest('/ai/flashcards', {
      method: 'POST',
      body: JSON.stringify({ content, subject }),
    });
  },
};

// Documents API
export const documentsAPI = {
  async upload(file: FormData): Promise<APIUploadedDocument> {
    return fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: file,
      timeout: API_CONFIG.TIMEOUT * 2, // Double timeout for uploads
    }).then(async response => {
      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          // Use status text if response is not JSON
        }
        throw new Error(errorMessage);
      }
      return response.json();
    });
  },

  async getAll(): Promise<APIUploadedDocument[]> {
    return apiRequest('/documents/');
  },

  async delete(documentId: string): Promise<{ message: string }> {
    return apiRequest(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  },

  async getContent(documentId: string): Promise<{ content: string; type: string }> {
    return apiRequest(`/documents/${documentId}/content`);
  },
};

// Progress API
export const progressAPI = {
  async getUserProgress(): Promise<APIUserProgress> {
    return apiRequest('/progress/');
  },

  async getUserProfile(): Promise<any> {
    return apiRequest('/progress/user');
  },

  async updateDailyGoal(goalMinutes: number): Promise<{ message: string; new_goal: number }> {
    return apiRequest('/progress/daily-goal', {
      method: 'PUT',
      body: JSON.stringify({ goal_minutes: goalMinutes }),
    });
  },

  async updateStreak(): Promise<{
    message: string;
    current_streak: number;
    goal_met: boolean;
  }> {
    return apiRequest('/progress/streak/update', {
      method: 'POST',
    });
  },
};

// Data transformation utilities
export const transformers = {
  // Convert API StudySession to frontend format
  studySessionFromAPI(apiSession: APIStudySession) {
    return {
      id: apiSession.id,
      subject: apiSession.subject,
      goal: apiSession.goal,
      technique: apiSession.technique,
      duration: apiSession.duration,
      startTime: new Date(apiSession.start_time),
      endTime: apiSession.end_time ? new Date(apiSession.end_time) : undefined,
      completed: apiSession.completed,
      focusScore: apiSession.focus_score,
      notes: apiSession.notes,
    };
  },

  // Convert API MindfulSession to frontend format
  mindfulSessionFromAPI(apiSession: APIMindfulSession) {
    return {
      id: apiSession.id,
      title: apiSession.title,
      category: apiSession.category,
      duration: apiSession.duration,
      audioUrl: apiSession.audio_url,
      description: apiSession.description,
      completed: apiSession.completed,
      completedAt: apiSession.completed_at ? new Date(apiSession.completed_at) : undefined,
      rating: apiSession.rating,
    };
  },

  // Convert API Conversation to frontend format
  conversationFromAPI(apiConversation: APIAidaConversation) {
    return {
      id: apiConversation.id,
      title: apiConversation.title,
      subject: apiConversation.subject,
      lastMessage: new Date(apiConversation.last_message),
      messages: apiConversation.messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        conversationId: msg.conversation_id,
      })),
    };
  },

  // Convert API Document to frontend format
  documentFromAPI(apiDocument: APIUploadedDocument) {
    return {
      id: apiDocument.id,
      name: apiDocument.name,
      type: apiDocument.type,
      uri: apiDocument.uri,
      uploadDate: new Date(apiDocument.upload_date),
      size: apiDocument.size,
    };
  },
}; 