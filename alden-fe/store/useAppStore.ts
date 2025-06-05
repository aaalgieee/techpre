import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  studySessionsAPI, 
  mindfulSessionsAPI, 
  aiChatAPI, 
  documentsAPI, 
  progressAPI,
  transformers 
} from '../services/api';

export interface StudySession {
  id: string;
  subject: string;
  goal: string;
  technique: 'pomodoro' | 'deep_work' | 'active_recall';
  duration: number; // in minutes
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  focusScore?: number; // 1-10
  notes?: string;
}

export interface MindfulSession {
  id: string;
  title: string;
  category: 'quick_relief' | 'pre_study' | 'post_study' | 'exam_support';
  duration: number; // in seconds
  audioUrl: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  rating?: number; // 1-5
}

export interface AidaMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  conversationId: string;
}

export interface AidaConversation {
  id: string;
  title: string;
  subject?: string;
  lastMessage: Date;
  messages: AidaMessage[];
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'text';
  uri: string;
  uploadDate: Date;
  size?: number;
}

interface AppState {
  // Study Sessions
  studySessions: StudySession[];
  activeSession: StudySession | null;
  
  // Mindful Moments
  mindfulSessions: MindfulSession[];
  completedMindfulSessions: string[]; // IDs of completed sessions
  
  // Aida AI Assistant
  aidaConversations: AidaConversation[];
  activeConversation: string | null;
  uploadedDocuments: UploadedDocument[];
  isAidaTyping: boolean;
  
  // User Progress
  dailyGoal: number; // minutes
  todayStudyTime: number; // minutes
  currentStreak: number;
  totalStudyTime: number; // minutes
  totalMindfulTime: number; // minutes
  
  // UI State
  currentScreen: string;
  isTimerRunning: boolean;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

interface AppActions {
  // Study Session Actions
  startStudySession: (session: Omit<StudySession, 'id' | 'startTime' | 'completed'>) => Promise<void>;
  endStudySession: (focusScore?: number, notes?: string) => Promise<void>;
  loadStudySessions: () => Promise<void>;
  checkActiveSession: () => Promise<void>;
  
  // Mindful Session Actions
  completeMindfulSession: (sessionId: string, rating?: number) => Promise<void>;
  loadMindfulSessions: () => Promise<void>;
  loadPrebuiltSessions: () => Promise<void>;
  
  // Aida Actions
  createConversation: (title?: string, subject?: string) => Promise<string>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  deleteConversation: (conversationId: string) => Promise<void>;
  uploadDocument: (document: Omit<UploadedDocument, 'id' | 'uploadDate'>) => Promise<void>;
  removeDocument: (documentId: string) => Promise<void>;
  loadDocuments: () => Promise<void>;
  setAidaTyping: (typing: boolean) => void;
  
  // Progress Actions
  loadUserProgress: () => Promise<void>;
  updateDailyGoal: (goal: number) => Promise<void>;
  updateStreak: () => Promise<void>;
  
  // UI Actions
  setCurrentScreen: (screen: string) => void;
  setTimerRunning: (running: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Initialization
  initializeApp: () => Promise<void>;
  
  // Reset Actions
  reset: () => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  studySessions: [],
  activeSession: null,
  mindfulSessions: [],
  completedMindfulSessions: [],
  aidaConversations: [],
  activeConversation: null,
  uploadedDocuments: [],
  isAidaTyping: false,
  dailyGoal: 120, // 2 hours default
  todayStudyTime: 0,
  currentStreak: 0,
  totalStudyTime: 0,
  totalMindfulTime: 0,
  currentScreen: 'home',
  isTimerRunning: false,
  isLoading: false,
  error: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Initialize app data
      initializeApp: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Load all data in parallel
          await Promise.all([
            get().loadStudySessions(),
            get().checkActiveSession(),
            get().loadConversations(),
            get().loadDocuments(),
            get().loadUserProgress(),
            get().loadPrebuiltSessions(),
          ]);
          
        } catch (error) {
          console.error('Failed to initialize app:', error);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Study Session Actions
      startStudySession: async (sessionData) => {
        try {
          set({ isLoading: true, error: null });
          
          const apiSession = await studySessionsAPI.create(sessionData);
          const session = transformers.studySessionFromAPI(apiSession);
          
          set({
            activeSession: session,
            isTimerRunning: true,
          });
          
        } catch (error) {
          console.error('Failed to start study session:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      endStudySession: async (focusScore, notes) => {
        try {
          const { activeSession } = get();
          if (!activeSession) return;
          
          set({ isLoading: true, error: null });
          
          const apiSession = await studySessionsAPI.endSession(activeSession.id, {
            focus_score: focusScore,
            notes,
          });
          
          const completedSession = transformers.studySessionFromAPI(apiSession);
          
          // Update sessions list
          const { studySessions } = get();
          const updatedSessions = studySessions.map(s => 
            s.id === activeSession.id ? completedSession : s
          );
          
          // If session not in list, add it
          if (!studySessions.find(s => s.id === activeSession.id)) {
            updatedSessions.push(completedSession);
          }
          
          set({
            activeSession: null,
            studySessions: updatedSessions,
            isTimerRunning: false,
          });
          
          // Reload user progress
          await get().loadUserProgress();
          
        } catch (error) {
          console.error('Failed to end study session:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      loadStudySessions: async () => {
        try {
          const apiSessions = await studySessionsAPI.getAll();
          const sessions = apiSessions.map(transformers.studySessionFromAPI);
          set({ studySessions: sessions });
        } catch (error) {
          console.error('Failed to load study sessions:', error);
          set({ error: error.message });
        }
      },
      
      checkActiveSession: async () => {
        try {
          const apiSession = await studySessionsAPI.getActive();
          if (apiSession) {
            const session = transformers.studySessionFromAPI(apiSession);
            set({ activeSession: session, isTimerRunning: true });
          }
        } catch (error) {
          console.error('Failed to check active session:', error);
          // Don't set error for this, as no active session is normal
        }
      },
      
      // Mindful Session Actions
      completeMindfulSession: async (sessionId, rating) => {
        try {
          set({ isLoading: true, error: null });
          
          const apiSession = await mindfulSessionsAPI.complete(sessionId, rating);
          const completedSession = transformers.mindfulSessionFromAPI(apiSession);
          
          const { mindfulSessions, completedMindfulSessions } = get();
          const updatedSessions = mindfulSessions.map(s => 
            s.id === sessionId ? completedSession : s
          );
          
          set({
            mindfulSessions: updatedSessions,
            completedMindfulSessions: [...completedMindfulSessions, sessionId],
          });
          
          // Reload user progress
          await get().loadUserProgress();
          
        } catch (error) {
          console.error('Failed to complete mindful session:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      loadMindfulSessions: async () => {
        try {
          const apiSessions = await mindfulSessionsAPI.getAll();
          const sessions = apiSessions.map(transformers.mindfulSessionFromAPI);
          set({ mindfulSessions: sessions });
        } catch (error) {
          console.error('Failed to load mindful sessions:', error);
          set({ error: error.message });
        }
      },
      
      loadPrebuiltSessions: async () => {
        try {
          const prebuiltSessions = await mindfulSessionsAPI.getPrebuilt();
          // Add prebuilt sessions to mindful sessions if not already present
          const { mindfulSessions } = get();
          const existingIds = new Set(mindfulSessions.map(s => s.id));
          
          const newSessions = prebuiltSessions
            .filter(session => !existingIds.has(session.id))
            .map(session => ({
              ...session,
              completed: false,
              audioUrl: session.audio_url,
            }));
          
          if (newSessions.length > 0) {
            set({ mindfulSessions: [...mindfulSessions, ...newSessions] });
          }
        } catch (error) {
          console.error('Failed to load prebuilt sessions:', error);
          // Don't set error for this, fallback to existing sessions
        }
      },
      
      // Aida Actions
      createConversation: async (title, subject) => {
        try {
          set({ isLoading: true, error: null });
          
          const apiConversation = await aiChatAPI.createConversation(
            title || 'New Conversation', 
            subject
          );
          const conversation = transformers.conversationFromAPI(apiConversation);
          
          const { aidaConversations } = get();
          set({
            aidaConversations: [conversation, ...aidaConversations],
            activeConversation: conversation.id,
          });
          
          return conversation.id;
          
        } catch (error) {
          console.error('Failed to create conversation:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      sendMessage: async (conversationId, content) => {
        try {
          const { aidaConversations } = get();
          
          // Add user message immediately for better UX
          const userMessage: AidaMessage = {
            id: Date.now().toString(),
            type: 'user',
            content,
            timestamp: new Date(),
            conversationId,
          };
          
          const updatedConversations = aidaConversations.map(conv => 
            conv.id === conversationId 
              ? {
                  ...conv,
                  messages: [...conv.messages, userMessage],
                  lastMessage: new Date(),
                }
              : conv
          );
          
          set({
            aidaConversations: updatedConversations,
            isAidaTyping: true,
          });
          
          // Send message to API
          const response = await aiChatAPI.sendMessage(content, conversationId);
          
          // The backend will process the AI response in the background
          // We need to poll for new messages or implement real-time updates
          setTimeout(async () => {
            try {
              await get().loadConversation(conversationId);
            } catch (error) {
              console.error('Failed to load updated conversation:', error);
            } finally {
              set({ isAidaTyping: false });
            }
          }, 2000); // Wait 2 seconds then reload conversation
          
        } catch (error) {
          console.error('Failed to send message:', error);
          set({ error: error.message, isAidaTyping: false });
          throw error;
        }
      },
      
      loadConversations: async () => {
        try {
          const apiConversations = await aiChatAPI.getConversations();
          const conversations = apiConversations.map(transformers.conversationFromAPI);
          set({ aidaConversations: conversations });
        } catch (error) {
          console.error('Failed to load conversations:', error);
          set({ error: error.message });
        }
      },
      
      loadConversation: async (conversationId) => {
        try {
          const apiConversation = await aiChatAPI.getConversation(conversationId);
          const conversation = transformers.conversationFromAPI(apiConversation);
          
          const { aidaConversations } = get();
          const updatedConversations = aidaConversations.map(conv =>
            conv.id === conversationId ? conversation : conv
          );
          
          set({ aidaConversations: updatedConversations });
        } catch (error) {
          console.error('Failed to load conversation:', error);
          set({ error: error.message });
        }
      },
      
      setActiveConversation: (conversationId) => {
        set({ activeConversation: conversationId });
      },
      
      deleteConversation: async (conversationId) => {
        try {
          set({ isLoading: true, error: null });
          
          await aiChatAPI.deleteConversation(conversationId);
          
          const { aidaConversations, activeConversation } = get();
          const updatedConversations = aidaConversations.filter(conv => conv.id !== conversationId);
          
          set({
            aidaConversations: updatedConversations,
            activeConversation: activeConversation === conversationId ? null : activeConversation,
          });
          
        } catch (error) {
          console.error('Failed to delete conversation:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      uploadDocument: async (document) => {
        try {
          set({ isLoading: true, error: null });
          
          // Create FormData for file upload
          const formData = new FormData();
          formData.append('file', {
            uri: document.uri,
            name: document.name,
            type: document.type === 'pdf' ? 'application/pdf' : 
                  document.type === 'image' ? 'image/jpeg' : 'text/plain',
          } as any);
          
          const apiDocument = await documentsAPI.upload(formData);
          const newDocument = transformers.documentFromAPI(apiDocument);
          
          const { uploadedDocuments } = get();
          set({
            uploadedDocuments: [newDocument, ...uploadedDocuments],
          });
          
        } catch (error) {
          console.error('Failed to upload document:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      removeDocument: async (documentId) => {
        try {
          set({ isLoading: true, error: null });
          
          await documentsAPI.delete(documentId);
          
          const { uploadedDocuments } = get();
          set({
            uploadedDocuments: uploadedDocuments.filter(doc => doc.id !== documentId),
          });
          
        } catch (error) {
          console.error('Failed to remove document:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      loadDocuments: async () => {
        try {
          const apiDocuments = await documentsAPI.getAll();
          const documents = apiDocuments.map(transformers.documentFromAPI);
          set({ uploadedDocuments: documents });
        } catch (error) {
          console.error('Failed to load documents:', error);
          set({ error: error.message });
        }
      },
      
      setAidaTyping: (typing) => {
        set({ isAidaTyping: typing });
      },
      
      // Progress Actions
      loadUserProgress: async () => {
        try {
          const progress = await progressAPI.getUserProgress();
          set({
            dailyGoal: progress.daily_goal,
            todayStudyTime: progress.today_study_time,
            currentStreak: progress.current_streak,
            totalStudyTime: progress.total_study_time,
            totalMindfulTime: progress.total_mindful_time,
          });
        } catch (error) {
          console.error('Failed to load user progress:', error);
          set({ error: error.message });
        }
      },
      
      updateDailyGoal: async (goal) => {
        try {
          set({ isLoading: true, error: null });
          
          await progressAPI.updateDailyGoal(goal);
          set({ dailyGoal: goal });
          
        } catch (error) {
          console.error('Failed to update daily goal:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateStreak: async () => {
        try {
          const result = await progressAPI.updateStreak();
          set({ currentStreak: result.current_streak });
        } catch (error) {
          console.error('Failed to update streak:', error);
          set({ error: error.message });
        }
      },
      
      // UI Actions
      setCurrentScreen: (screen) => {
        set({ currentScreen: screen });
      },
      
      setTimerRunning: (running) => {
        set({ isTimerRunning: running });
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      setError: (error) => {
        set({ error });
      },
      
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'alden-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist UI state and user preferences, not data that comes from API
      partialize: (state) => ({
        activeConversation: state.activeConversation,
        currentScreen: state.currentScreen,
        dailyGoal: state.dailyGoal,
      }),
    }
  )
); 