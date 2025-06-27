from fastapi import APIRouter, UploadFile, File, HTTPException, status
import shutil
import os
from rag_core import initialize_rag_chain, get_rag_answer

router = APIRouter()

@router.post("/uploadfile/")
async def upload_file(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    # Save the uploaded file temporarily
    file_location = f"./temp_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        initialize_rag_chain(file_location)
        return {"message": f"File {file.filename} processed successfully!"}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {e}")
    finally:
        # Clean up the temporary file
        os.remove(file_location)

@router.post("/chat/")
async def chat_with_rag(query: dict):
    user_query = query.get("question")
    if not user_query:
        raise HTTPException(status_code=400, detail="Question not provided.")

    try:
        answer = get_rag_answer(user_query)
        return {"answer": answer}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting answer: {e}")
