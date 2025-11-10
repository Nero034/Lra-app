from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import base64, os, requests, threading, datetime
from dotenv import load_dotenv
from bson import ObjectId
from pymongo import MongoClient

load_dotenv()

router = APIRouter()
jobs = {}  # armazenamento em memória temporário (poderia ser Mongo também)

# Configurações
MONGO_URI = os.getenv("MONGO_URI")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_TIMEOUT = int(os.getenv("OPENAI_TIMEOUT", "25"))

# Conexão com o banco (opcional — para persistência)
client = MongoClient(MONGO_URI)
db = client["lraapp"]
jobs_col = db.get_collection("ocr_jobs")

def process_in_background(job_id: str, img_base64: str):
    """Executa o OCR em segundo plano"""
    try:
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "gpt-4o-mini",
            "input": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Extraia de forma estruturada todas as informações "
                                "do medicamento contidas nesta imagem e organize em texto "
                                "com os campos: Nome, Fórmula, Conteúdo, Laboratório, "
                                "Validade e Preço. Retorne apenas o texto formatado."
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": f"data:image/jpeg;base64,{img_base64}",
                        },
                    ],
                }
            ],
        }

        response = requests.post(
            "https://api.openai.com/v1/responses",
            headers=headers,
            json=payload,
            timeout=OPENAI_TIMEOUT,
        )

        if response.status_code != 200:
            jobs[job_id]["status"] = "error"
            jobs[job_id]["error"] = response.text
            return

        data = response.json()
        text = (
            data.get("output", [{}])[0]
            .get("content", [{}])[0]
            .get("text", "")
        ).strip()

        jobs[job_id]["status"] = "done"
        jobs[job_id]["text"] = text

        # salva no banco (opcional)
        jobs_col.insert_one({
            "_id": ObjectId(job_id),
            "status": "done",
            "text": text,
            "created_at": datetime.datetime.utcnow()
        })

    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)


@router.post("/ocr")
async def ocr_via_ai(file: UploadFile = File(...)):
    """Recebe imagem, envia para IA e devolve job_id"""
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="Falta OPENAI_API_KEY configurada")

    file_bytes = await file.read()
    img_base64 = base64.b64encode(file_bytes).decode("utf-8")
    job_id = str(ObjectId())

    jobs[job_id] = {"status": "queued", "text": "", "error": None}

    threading.Thread(target=process_in_background, args=(job_id, img_base64)).start()

    return {"status": "queued", "job_id": job_id}


@router.get("/result/{job_id}")
async def get_ocr_result(job_id: str):
    """Retorna o resultado do OCR"""
    job = jobs.get(job_id)

    if not job:
        record = jobs_col.find_one({"_id": ObjectId(job_id)})
        if not record:
            raise HTTPException(status_code=404, detail="Job ID não encontrado")
        return JSONResponse(content={"status": record["status"], "text": record.get("text")})

    return JSONResponse(content=job)
