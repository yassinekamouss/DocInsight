# RAG Application: Document Q&A with Google Gemini AI

<p align="center">
  <img src="rag-frontend/src/assets/Capture_d'écran.png" alt="Application Screenshot" width="600"/>
</p>

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Environment Configuration](#4-environment-configuration)
- [Running the Application](#running-the-application)
  - [Start Backend Server](#start-backend-server)
  - [Start Frontend Development Server](#start-frontend-development-server)
- [Usage Instructions](#usage-instructions)
- [API Endpoints](#api-endpoints)
  - [Upload PDF](#upload-pdf)
  - [Ask Question](#ask-question)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Building for Production](#building-for-production)
  - [Backend Production Build](#backend-production-build)
  - [Frontend Production Build](#frontend-production-build)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
  - [Common Issues & Solutions](#common-issues--solutions)
  - [Support](#support)
- [Future Enhancements](#future-enhancements)

## Overview

This Retrieval-Augmented Generation (RAG) application empowers users to interact with their PDF documents by leveraging Google's Gemini AI. It intelligently combines document retrieval with advanced generative AI capabilities to provide accurate, context-aware answers directly from the content of uploaded PDFs.

## Key Features

*   **PDF Document Upload**: Seamlessly upload PDF files for comprehensive processing and analysis.
*   **Intelligent Question Answering**: Ask natural language questions about your uploaded documents and receive AI-powered responses grounded in the document's content.
*   **Conversational Memory**: The application maintains chat history, enabling context-aware and fluid conversations.
*   **Modern User Interface**: A clean, responsive, and intuitive frontend built with React and styled with Tailwind CSS for an optimal user experience.
*   **High-Performance Backend**: A robust FastAPI backend ensures fast and efficient processing with asynchronous support.
*   **Efficient Vector Search**: Utilizes FAISS (Facebook AI Similarity Search) for rapid and precise similarity searches and document retrieval.
*   **Google Gemini Integration**: Powered by Google's cutting-edge Gemini AI models for both embedding generation and conversational AI.

## Architecture

The application employs a modern full-stack architecture designed for scalability and performance:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │───▶│  FastAPI Server │───▶│   Google Gemini │
│   (Frontend)    │    │   (Backend)     │    │      AI API     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │  FAISS Vector   │
                       │     Store       │
                       └─────────────────┘
```

## Technology Stack

### Backend

*   **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python 3.7+.
*   **LangChain**: A powerful framework for developing applications powered by large language models.
*   **FAISS**: Facebook AI Similarity Search, a library for efficient similarity search and clustering of dense vectors.
*   **Google Generative AI**: Integration with Google's Gemini models for embeddings and chat functionalities.
*   **PyPDF**: A pure-Python PDF library capable of splitting, merging, cropping, and transforming PDF pages.
*   **Python-dotenv**: Manages environment variables for secure configuration.

### Frontend

*   **React 19**: A declarative, component-based JavaScript library for building user interfaces.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
*   **Vite**: A next-generation frontend tooling that provides an extremely fast development experience.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
*   **React Markdown**: A React component to render Markdown.
*   **React Icons**: A collection of popular icon packs as React components.

## Prerequisites

Before setting up the application, ensure you have the following installed:

*   **Python 3.8+**
*   **Node.js 16+** and **npm**
*   **Google API Key**: Obtain your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

## Installation Guide

Follow these steps to get the RAG application up and running on your local machine.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd RAG_application
```

### 2. Backend Setup

Navigate to the `backend` directory and set up the Python environment:

```bash
cd backend

# Create a virtual environment (highly recommended)
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

Navigate to the `rag-frontend` directory and install Node.js dependencies:

```bash
cd rag-frontend

# Install frontend dependencies
npm install
```

### 4. Environment Configuration

Create a `.env` file in the `backend` directory (`RAG_application/backend/.env`) and populate it with your Google API Key and model preferences:

```env
# Google AI Configuration
GOOGLE_API_KEY=your_google_api_key_here
CHAT_MODEL=gemini-1.5-flash
EMBEDDING_MODEL=models/embedding-001
```

## Running the Application

To run the full RAG application, you need to start both the backend and frontend servers.

### Start Backend Server

From the `backend` directory:

```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The FastAPI backend API will be accessible at `http://localhost:8000`.
API documentation (Swagger UI) can be found at `http://localhost:8000/docs`.

### Start Frontend Development Server

From the `rag-frontend` directory:

```bash
cd rag-frontend
npm run dev
```

The React frontend application will be available at `http://localhost:5173`.

## Usage Instructions

1.  **Ensure both the backend and frontend servers are running.**
2.  **Open your web browser** and navigate to `http://localhost:5173`.
3.  **Upload a PDF document** using the provided interface.
4.  **Enter your questions** about the document content in the chat interface.
5.  **Receive AI-powered answers** that are contextually relevant to your uploaded PDF.

## API Endpoints

### Upload PDF

*   **Endpoint**: `/uploadfile/`
*   **Method**: `POST`
*   **Content-Type**: `multipart/form-data`
*   **Body**: PDF file

### Ask Question

*   **Endpoint**: `/ask/`
*   **Method**: `POST`
*   **Content-Type**: `application/json`
*   **Body**:
    ```json
    {
      "question": "Your question about the uploaded document"
    }
    ```

## Project Structure

```
RAG_application/
├── backend/
│   ├── app.py              # Main FastAPI application entry point
│   ├── api.py              # Defines API routes and handlers
│   ├── rag_core.py         # Core RAG logic and LangChain integration
│   ├── config.py           # Application configuration management
│   └── requirements.txt    # Python dependencies for the backend
├── rag-frontend/
│   ├── src/
│   │   ├── App.tsx         # Main React component for the application UI
│   │   ├── main.tsx        # React application entry point
│   │   └── assets/         # Static assets like images and icons
│   ├── package.json        # Node.js dependencies for the frontend
│   └── vite.config.ts      # Vite build tool configuration
└── README.md              # Project README file
```

## Environment Variables

| Variable          | Description                                  | Default Value          |
| :---------------- | :------------------------------------------- | :--------------------- |
| `GOOGLE_API_KEY`  | Your Google AI API key (required)            | -                      |
| `CHAT_MODEL`      | The Gemini chat model to be used             | `gemini-1.5-flash`     |
| `EMBEDDING_MODEL` | The embedding model for vector generation    | `models/embedding-001` |

## Building for Production

### Backend Production Build

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```
For production deployments, consider using a production-ready ASGI server like Gunicorn with Uvicorn workers.

### Frontend Production Build

```bash
cd rag-frontend
npm run build
npm run preview
```
The `npm run build` command will create an optimized production build in the `dist` directory. `npm run preview` can be used to serve this build locally for testing.

## Contributing

We welcome contributions to this project! Please follow these steps:

1.  **Fork** the repository.
2.  **Create a new feature branch**: `git checkout -b feature/your-feature-name`
3.  **Commit your changes**: `git commit -m 'Add your descriptive commit message'`
4.  **Push to the branch**: `git push origin feature/your-feature-name`
5.  **Open a Pull Request** to the `main` branch of this repository.

## Troubleshooting

### Common Issues & Solutions

1.  **Google API Key Error**:
    *   **Solution**: Double-check that your `GOOGLE_API_KEY` is correctly set in the `backend/.env` file and is valid.
2.  **Port Already in Use**:
    *   **Solution**: If you encounter an error indicating a port is already in use, you can change the port numbers in the `uvicorn` and `npm run dev` commands.
3.  **PDF Upload Fails**:
    *   **Solution**: Verify that the file you are uploading is a valid PDF document and check for any file size limits imposed by the server (though none are explicitly set by default in this basic setup).
4.  **CORS Issues**:
    *   **Solution**: If you experience Cross-Origin Resource Sharing (CORS) errors, ensure that the CORS configuration in the FastAPI backend (`app.py` or `api.py`) correctly allows requests from your frontend's origin (`http://localhost:5173`).

### Support

For any questions, bug reports, or feature requests, please open an issue on the GitHub repository.

---

## Future Enhancements

We are continuously working to improve this application. Planned enhancements include:

*   Support for multiple document formats (e.g., Word, TXT, Markdown).
*   User authentication and session management for personalized experiences.
*   A dedicated document management dashboard.
*   Advanced search and filtering capabilities.
*   Export functionality for conversation history.
*   Multi-language support.
*   Docker containerization for easier deployment.

---

Built with ❤️ using React, FastAPI, and Google Gemini AI.
