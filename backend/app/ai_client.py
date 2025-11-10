# backend/app/ai_client.py

import os
import base64
import aiohttp
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import asyncio
import logging

load_dotenv()

router = APIRouter(prefix="/api/ai", tags=["AI"])

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("❌ OPENAI_API_KEY não encontrado no ambiente!")

# Configura logging
logging.basicConfig(level=logging.INFO)

# Memória temporária de tarefas
ocr_jobs = {}

# ==========================================
# 🔹 Rota principal - Recebe a imagem
# ==========================================
@router.post("/ocr")
async def process_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode("utf-8")

        job_id = str(hash(file.filename + str(len(contents))))
        ocr_jobs[job_id] = {"status": "queued", "text": None}

        asyncio.create_task(call_openai_ocr(image_base64, job_id))
        return {"status": "queued", "job_id": job_id}

    except Exception as e:
        logging.exception("Erro no upload de imagem")
        raise HTTPException(status_code=500, detail=f"Erro ao processar imagem: {str(e)}")


# ==========================================
# 🔹 Rota de status - Verifica resultado do OCR
# ==========================================
@router.get("/status/{job_id}")
async def check_status(job_id: str):
    job = ocr_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    return job


# ==========================================
# 🔹 Função interna - Chama o OpenAI GPT-4o-mini
# ==========================================
async def call_openai_ocr(image_base64: str, job_id: str):
    url = "https://api.openai.com/v1/responses"
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
                        "type": "input_text",
                        "text": (
                            "Extraia do rótulo da imagem todos os dados legíveis sobre o remédio. "
                            "Organize o texto sem interpretações, mantendo o que estiver visível."
                        ),
                    },
                    {
                        "type": "input_image",
                        "image_data": image_base64,
                    },
                ],
            }
        ],
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=payload) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logging.error(f"Erro da OpenAI: {error_text}")
                    ocr_jobs[job_id] = {"status": "error", "text": "", "error": error_text}
                    return

                data = await response.json()
                result_text = (
                    data.get("output", [{}])[0]
                    .get("content", [{}])[0]
                    .get("text", "")
                    .strip()
                )

                ocr_jobs[job_id] = {"status": "done", "text": result_text}

    except Exception as e:
        logging.exception("Erro na chamada OpenAI OCR")
        ocr_jobs[job_id] = {"status": "error", "text": "", "error": str(e)}


# ==========================================
# 🔹 Health check interno
# ==========================================
@router.get("/ping")
async def ping():
    return JSONResponse({"message": "AI client ativo ✅"})
