# config.py
import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    
    @classmethod
    def validate(cls):
        if not cls.GEMINI_API_KEY:
            print("WARNING: GEMINI_API_KEY not found in environment. The AI chat will use a fallback mock responder.")
        else:
            print("Gemini API Key loaded successfully.")
