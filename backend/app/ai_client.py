from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os, base64, requests, threading, datetime
from dotenv import load_dotenv
from bson import ObjectId
from pymongo import MongoClient

load_dotenv()

router = APIRouter()
jobs = {}  # armazenamento em memória temporário

# Configurações
MONGO_URI = os.getenv("MONGO_URI")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_TIMEOUT = int(os.getenv("OPENAI_TIMEOUT", "25"))

# Conexão com banco (para persistência de fila)
client = MongoClient(MONGO_URI)
db = client["lraapp"]
jobs_col = db.get_collection("ocr_jobs")


def process_in_background(job_id: str, img_base64: str):
    """Executa o OCR em segundo plano"""
    try:
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }

        # ⚙️ Payload atualizado com novos tipos "input_text" e "input_image"
        payload = {
            "model": "gpt-4o-mini",
            "input": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": "Extraia todo o texto legível da imagem abaixo. Não traduza, apenas reconheça o conteúdo textual."
                        },
                        {
                            "type": "input_image",
                            "image_url": {"url": f"data:image/png;base64,{img_base64}"}
                        }
                    ]
                }
            ]
        }

        response = requests.post(
            "https://api.openai.com/v1/responses",
            headers=headers,
            json=payload,
            timeout=OPENAI_TIMEOUT
        )

        data = response.json()

        # verifica se veio texto
        if "output" in data and len(data["output"]) > 0:
            text = data["output"][0].get("content", "")
            result = {"status": "done", "text": text}
        else:
            result = {"status": "error", "error": data}

    except Exception as e:
        result = {"status": "error", "text": "", "error": str(e)}

    # salva no banco e memória
    jobs[job_id] = result
    jobs_col.update_one({"_id": ObjectId(job_id)}, {"$set": result})


@router.post("/api/ai/ocr")
async def upload_image(file: UploadFile = File(...)):
    """Recebe imagem e agenda OCR"""
    try:
        contents = await file.read()
        img_base64 = base64.b64encode(contents).decode("utf-8")

        # Cria ID do job
        job = {"created_at": datetime.datetime.utcnow(), "status": "queued"}
        inserted = jobs_col.insert_one(job)
        job_id = str(inserted.inserted_id)

        # Inicia thread para processamento
        thread = threading.Thread(target=process_in_background, args=(job_id, img_base64))
        thread.start()

        return JSONResponse({"status": "queued", "job_id": job_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/ai/status/{job_id}")
async def get_job_status(job_id: str):
    """Verifica o status de um OCR"""
    job = jobs_col.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    job["_id"] = str(job["_id"])
    return job
