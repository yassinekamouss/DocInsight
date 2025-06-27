import os
from dotenv import load_dotenv

def load_environment_variables():
    load_dotenv()

def get_api_key():
    return os.getenv("GOOGLE_API_KEY")

def get_chat_model():
    return os.getenv("CHAT_MODEL", "gemini-1.5-flash")

def get_embedding_model():
    return os.getenv("EMBEDDING_MODEL", "models/embedding-001")
