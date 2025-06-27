import os
import shutil
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI

# Global variables to store the RAG chain and chat history
qa_chain = None
chat_history = []

def initialize_rag_chain(file_path: str):
    global qa_chain, chat_history
    chat_history = [] # Reset chat history on new file upload

    load_dotenv() # Ensure environment variables are loaded
    api_key = os.getenv("GOOGLE_API_KEY")
    chat_model = os.getenv("CHAT_MODEL", "gemini-1.5-flash")
    embedding_model = os.getenv("EMBEDDING_MODEL", "models/embedding-001")

    if not api_key:
        raise ValueError("Gemini API key not found. Please make sure it's set in the .env file.")

    # Load the PDF
    loader = PyPDFLoader(file_path)
    documents = loader.load()

    # Split the document into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = text_splitter.split_documents(documents)

    # Create embeddings
    embeddings = GoogleGenerativeAIEmbeddings(model=embedding_model, google_api_key=api_key)
    
    # Create FAISS vector store
    db = FAISS.from_documents(docs, embeddings)

    # Create the chat model
    model = ChatGoogleGenerativeAI(model=chat_model, google_api_key=api_key,
                                 temperature=0.2)

    # Create the conversational retrieval chain
    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=model,
        retriever=db.as_retriever(),
        return_source_documents=True
    )

def get_rag_answer(query: str):
    global qa_chain, chat_history

    if not qa_chain:
        raise ValueError("RAG chain not initialized. Please upload a PDF first.")

    result = qa_chain.invoke({"question": query, "chat_history": chat_history})
    chat_history.append((query, result["answer"]))
    return result["answer"]
