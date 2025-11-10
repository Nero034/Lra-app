# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.ai_client import router as ai_router
import os

app = FastAPI(
    title="LRA App Backend",
    description="API para OCR de imagens de remédios usando OpenAI GPT-4o-mini",
    version="1.0.0",
)

# 🌍 Configuração de CORS para permitir comunicação com o frontend (Vercel)
origins = [
    "http://localhost:5173",
    "https://lra-app-obm2.vercel.app",  # frontend na Vercel
    "https://lra-app-0uq6.onrender.com",  # backend Render (para requisições internas)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🚀 Rotas principais
@app.get("/health")
async def health_check():
    """Verifica se o servidor está online."""
    return {"status": "ok"}

# Importa e inclui as rotas da IA (OCR)
app.include_router(ai_router)

# ✅ Mensagem padrão para confirmar que a API está ativa
@app.get("/")
async def root():
    return {
        "message": "LRA App Backend online ✅. Use /api/ai/ocr para enviar imagens."
    }
