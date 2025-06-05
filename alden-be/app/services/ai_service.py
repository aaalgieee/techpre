import os
import asyncio
import base64
import io
from typing import Optional, List
from google import genai
from google.genai import types
from ..config import settings

class AIService:
    def __init__(self):
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        """Initialize the Gemini AI client"""
        if settings.gemini_api_key:
            self.client = genai.Client(
                http_options={"api_version": "v1beta"},
                api_key=settings.gemini_api_key,
            )
        else:
            print("Warning: GEMINI_API_KEY not set. AI functionality will be limited.")

    async def generate_study_response(self, message: str, subject: Optional[str] = None, documents: Optional[List[str]] = None) -> str:
        """Generate AI response for study-related queries"""
        if not self.client:
            return self._fallback_response(message)

        try:
            # Build context for study assistance
            context = "You are Aida, an AI study assistant. You help students with their studies by:"
            context += "\n• Explaining complex concepts in simple terms"
            context += "\n• Creating study materials like flashcards and quizzes"
            context += "\n• Providing study strategies and techniques"
            context += "\n• Answering questions about any subject"
            context += "\n• Breaking down problems step by step"
            
            if subject:
                context += f"\n\nThe student is currently studying: {subject}"
            
            if documents:
                context += f"\n\nThe student has uploaded {len(documents)} document(s) for reference."
            
            context += "\n\nRespond in a helpful, encouraging, and educational manner."
            
            full_prompt = f"{context}\n\nStudent question: {message}\n\nAida's response:"
            
            # Use Gemini to generate response
            response = await self._call_gemini_api(full_prompt)
            return response
            
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return self._fallback_response(message)

    async def _call_gemini_api(self, prompt: str) -> str:
        """Call the Gemini API with the given prompt"""
        try:
            # For now, we'll use a simple text generation
            # In a full implementation, you might want to use the live API
            # or other Gemini models based on your needs
            
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt
            )
            
            return response.text if response and response.text else self._fallback_response(prompt)
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            return self._fallback_response(prompt)

    def _fallback_response(self, message: str) -> str:
        """Provide fallback responses when AI is not available"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['math', 'calculus', 'algebra', 'geometry']):
            return "I'd be happy to help with math! Can you share the specific problem or concept you're working on? I can break it down step by step and create practice problems for you."
        
        elif any(word in message_lower for word in ['physics', 'chemistry', 'biology', 'science']):
            return "Science can be challenging but rewarding! What topic are you studying? I can explain concepts, provide examples, and help you understand the underlying principles."
        
        elif any(word in message_lower for word in ['study', 'learn', 'review']):
            return "Great question about studying! Here are some tips:\n\n• Break complex topics into smaller chunks\n• Use active recall to test yourself\n• Practice spaced repetition\n• Connect new concepts to what you already know\n\nWhat subject are you focusing on?"
        
        elif any(word in message_lower for word in ['exam', 'test', 'quiz']):
            return "Preparing for an exam? Here's how I can help:\n\n• Create practice questions from your notes\n• Generate flashcards for key concepts\n• Build a study schedule\n• Explain difficult topics\n\nWould you like to upload your study materials so I can create personalized practice questions?"
        
        elif any(word in message_lower for word in ['flashcard', 'practice', 'question']):
            return "I can create flashcards and practice questions based on your study materials! Just upload your notes, textbook chapters, or lecture slides, and I'll generate:\n\n• Key term flashcards\n• Multiple choice questions\n• Short answer prompts\n• Concept review questions\n\nWhat material would you like me to work with?"
        
        elif any(word in message_lower for word in ['help', 'stuck', 'confused', 'understand']):
            return "I'm here to help you understand! Let me know:\n\n• What specific concept you're struggling with\n• What you've tried so far\n• What part is most confusing\n\nI'll break it down into simpler steps and provide examples to make it clearer."
        
        else:
            return "I'm here to help with your studies! I can:\n\n• Explain complex concepts in simple terms\n• Create study materials like flashcards and quizzes\n• Help you organize information and create outlines\n• Answer questions about any subject\n• Provide study strategies\n\nWhat would you like to work on today?"

    async def generate_flashcards(self, content: str, subject: Optional[str] = None) -> List[dict]:
        """Generate flashcards from study content"""
        if not self.client:
            return self._fallback_flashcards()

        try:
            prompt = f"Create 5-10 flashcards from the following content. "
            prompt += f"Format as JSON with 'question' and 'answer' fields. "
            if subject:
                prompt += f"Focus on {subject} concepts. "
            prompt += f"\n\nContent: {content}"

            response = await self._call_gemini_api(prompt)
            
            # Parse the response and extract flashcards
            # This is a simplified version - you might want to add better parsing
            flashcards = self._parse_flashcards_response(response)
            return flashcards
            
        except Exception as e:
            print(f"Error generating flashcards: {e}")
            return self._fallback_flashcards()

    def _parse_flashcards_response(self, response: str) -> List[dict]:
        """Parse AI response to extract flashcards"""
        # This is a simplified parser - you might want to use more robust JSON parsing
        flashcards = []
        try:
            # Look for question/answer patterns in the response
            lines = response.split('\n')
            current_flashcard = {}
            
            for line in lines:
                if 'question' in line.lower() or 'q:' in line.lower():
                    if current_flashcard and 'question' in current_flashcard and 'answer' in current_flashcard:
                        flashcards.append(current_flashcard)
                        current_flashcard = {}
                    current_flashcard['question'] = line.strip()
                elif 'answer' in line.lower() or 'a:' in line.lower():
                    current_flashcard['answer'] = line.strip()
            
            if current_flashcard and 'question' in current_flashcard and 'answer' in current_flashcard:
                flashcards.append(current_flashcard)
                
        except Exception:
            pass
        
        return flashcards if flashcards else self._fallback_flashcards()

    def _fallback_flashcards(self) -> List[dict]:
        """Provide fallback flashcards when AI is not available"""
        return [
            {
                "question": "What is the best way to study effectively?",
                "answer": "Use active recall, spaced repetition, and break content into smaller chunks."
            },
            {
                "question": "How long should study sessions be?",
                "answer": "25-50 minutes with 5-15 minute breaks (Pomodoro technique) or longer for deep work."
            },
            {
                "question": "What is active recall?",
                "answer": "Testing yourself on material without looking at notes to strengthen memory."
            }
        ]

# Create a singleton instance
ai_service = AIService()