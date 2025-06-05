import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

interface AppActions {
  // Study Session Actions
  startStudySession: (session: Omit<StudySession, 'id' | 'startTime' | 'completed'>) => void;
  endStudySession: (focusScore?: number, notes?: string) => void;
  addStudySession: (session: StudySession) => void;
  
  // Mindful Session Actions
  completeMindfulSession: (sessionId: string, rating?: number) => void;
  
  // Aida Actions
  createConversation: (title?: string, subject?: string) => string;
  sendMessage: (conversationId: string, content: string) => void;
  addAidaResponse: (conversationId: string, content: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
  deleteConversation: (conversationId: string) => void;
  uploadDocument: (document: Omit<UploadedDocument, 'id' | 'uploadDate'>) => void;
  removeDocument: (documentId: string) => void;
  setAidaTyping: (typing: boolean) => void;
  
  // Progress Actions
  updateDailyGoal: (goal: number) => void;
  updateStreak: () => void;
  
  // UI Actions
  setCurrentScreen: (screen: string) => void;
  setTimerRunning: (running: boolean) => void;
  
  // Reset Actions
  reset: () => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  studySessions: [],
  activeSession: null,
  mindfulSessions: [
    {
      id: '1',
      title: 'Focus Boost',
      category: 'pre_study',
      duration: 240, // 4 minutes
      audioUrl: '', // We'll add actual audio later
      description: 'A 4-minute meditation to prepare your mind for focused study',
      completed: false,
    },
    {
      id: '2',
      title: 'SOS Breathing',
      category: 'quick_relief',
      duration: 60, // 1 minute
      audioUrl: '',
      description: 'Quick breathing exercise for immediate stress relief',
      completed: false,
    },
    {
      id: '3',
      title: 'Study Reflection',
      category: 'post_study',
      duration: 420, // 7 minutes
      audioUrl: '',
      description: 'Wind down and reflect on your study session',
      completed: false,
    },
    {
      id: '4',
      title: 'Pre-Exam Calm',
      category: 'exam_support',
      duration: 600, // 10 minutes
      audioUrl: '',
      description: 'Calm your nerves before an important exam',
      completed: false,
    },
  ],
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
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      startStudySession: (sessionData) => {
        const newSession: StudySession = {
          ...sessionData,
          id: Date.now().toString(),
          startTime: new Date(),
          completed: false,
        };
        
        set({
          activeSession: newSession,
          isTimerRunning: true,
        });
      },
      
      endStudySession: (focusScore, notes) => {
        const { activeSession, studySessions, todayStudyTime, totalStudyTime } = get();
        
        if (!activeSession) return;
        
        const endTime = new Date();
        const actualDuration = Math.floor(
          (endTime.getTime() - activeSession.startTime.getTime()) / 1000 / 60
        );
        
        const completedSession: StudySession = {
          ...activeSession,
          endTime,
          duration: actualDuration,
          completed: true,
          focusScore,
          notes,
        };
        
        set({
          activeSession: null,
          studySessions: [...studySessions, completedSession],
          todayStudyTime: todayStudyTime + actualDuration,
          totalStudyTime: totalStudyTime + actualDuration,
          isTimerRunning: false,
        });
      },
      
      addStudySession: (session) => {
        const { studySessions } = get();
        set({
          studySessions: [...studySessions, session],
        });
      },
      
      completeMindfulSession: (sessionId, rating) => {
        const { completedMindfulSessions, mindfulSessions, totalMindfulTime } = get();
        const session = mindfulSessions.find(s => s.id === sessionId);
        
        if (!session) return;
        
        const updatedSessions = mindfulSessions.map(s => 
          s.id === sessionId 
            ? { ...s, completed: true, completedAt: new Date(), rating }
            : s
        );
        
        set({
          mindfulSessions: updatedSessions,
          completedMindfulSessions: [...completedMindfulSessions, sessionId],
          totalMindfulTime: totalMindfulTime + Math.floor(session.duration / 60),
        });
      },
      
      // Aida Actions
      createConversation: (title, subject) => {
        const { aidaConversations } = get();
        const conversationId = Date.now().toString();
        const newConversation: AidaConversation = {
          id: conversationId,
          title: title || 'New Conversation',
          subject,
          lastMessage: new Date(),
          messages: [],
        };
        
        set({
          aidaConversations: [...aidaConversations, newConversation],
          activeConversation: conversationId,
        });
        
        return conversationId;
      },
      
      sendMessage: (conversationId, content) => {
        const { aidaConversations } = get();
        const messageId = Date.now().toString();
        const userMessage: AidaMessage = {
          id: messageId,
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
        
        // Simulate AI response after a delay
        setTimeout(() => {
          get().addAidaResponse(conversationId, get().generateAidaResponse(content));
        }, 1500 + Math.random() * 2000); // 1.5-3.5 second delay
      },
      
      addAidaResponse: (conversationId, content) => {
        const { aidaConversations } = get();
        const messageId = Date.now().toString();
        const aidaMessage: AidaMessage = {
          id: messageId,
          type: 'assistant',
          content,
          timestamp: new Date(),
          conversationId,
        };
        
        const updatedConversations = aidaConversations.map(conv => 
          conv.id === conversationId 
            ? {
                ...conv,
                messages: [...conv.messages, aidaMessage],
                lastMessage: new Date(),
              }
            : conv
        );
        
        set({
          aidaConversations: updatedConversations,
          isAidaTyping: false,
        });
      },
      
      generateAidaResponse: (userMessage: string) => {
        // Simple response generator for MVP - in real app this would call Gemini API
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('math') || lowerMessage.includes('calculus') || lowerMessage.includes('algebra')) {
          return "I'd be happy to help with math! Can you share the specific problem or concept you're working on? I can break it down step by step and create practice problems for you.";
        }
        
        if (lowerMessage.includes('physics')) {
          return "Physics can be challenging but rewarding! What topic are you studying? I can explain concepts, provide examples, and help you understand the underlying principles.";
        }
        
        if (lowerMessage.includes('study') || lowerMessage.includes('learn')) {
          return "Great question about studying! Here are some tips:\n\n• Break complex topics into smaller chunks\n• Use active recall to test yourself\n• Practice spaced repetition\n• Connect new concepts to what you already know\n\nWhat subject are you focusing on?";
        }
        
        if (lowerMessage.includes('exam') || lowerMessage.includes('test')) {
          return "Preparing for an exam? Here's how I can help:\n\n• Create practice questions from your notes\n• Generate flashcards for key concepts\n• Build a study schedule\n• Explain difficult topics\n\nWould you like to upload your study materials so I can create personalized practice questions?";
        }
        
        if (lowerMessage.includes('flashcard') || lowerMessage.includes('quiz')) {
          return "I can create flashcards and quizzes based on your study materials! Just upload your notes, textbook chapters, or lecture slides, and I'll generate:\n\n• Key term flashcards\n• Multiple choice questions\n• Short answer prompts\n• Concept review questions\n\nWhat material would you like me to work with?";
        }
        
        return "I'm here to help with your studies! I can:\n\n• Explain complex concepts in simple terms\n• Create study materials like flashcards and quizzes\n• Help you organize information and create outlines\n• Answer questions about any subject\n• Provide study strategies\n\nWhat would you like to work on today?";
      },
      
      setActiveConversation: (conversationId) => {
        set({ activeConversation: conversationId });
      },
      
      deleteConversation: (conversationId) => {
        const { aidaConversations, activeConversation } = get();
        const updatedConversations = aidaConversations.filter(conv => conv.id !== conversationId);
        
        set({
          aidaConversations: updatedConversations,
          activeConversation: activeConversation === conversationId ? null : activeConversation,
        });
      },
      
      uploadDocument: (document) => {
        const { uploadedDocuments } = get();
        const newDocument: UploadedDocument = {
          ...document,
          id: Date.now().toString(),
          uploadDate: new Date(),
        };
        
        set({
          uploadedDocuments: [...uploadedDocuments, newDocument],
        });
      },
      
      removeDocument: (documentId) => {
        const { uploadedDocuments } = get();
        set({
          uploadedDocuments: uploadedDocuments.filter(doc => doc.id !== documentId),
        });
      },
      
      setAidaTyping: (typing) => {
        set({ isAidaTyping: typing });
      },
      
      updateDailyGoal: (goal) => {
        set({ dailyGoal: goal });
      },
      
      updateStreak: () => {
        const { currentStreak, todayStudyTime, dailyGoal } = get();
        if (todayStudyTime >= dailyGoal) {
          set({ currentStreak: currentStreak + 1 });
        }
      },
      
      setCurrentScreen: (screen) => {
        set({ currentScreen: screen });
      },
      
      setTimerRunning: (running) => {
        set({ isTimerRunning: running });
      },
      
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'alden-app-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 