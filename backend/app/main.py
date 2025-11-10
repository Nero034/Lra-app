from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.ai_client import router as ai_router

app = FastAPI(
    title="LRA App Backend",
    description="Backend do aplicativo LRA para OCR de medicamentos via IA",
    version="1.0.0"
)

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou ["https://lra-app-obm2.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    """Verifica se o servidor está online"""
    return {"status": "ok"}

# 👇 Importante: isso habilita as rotas da IA!
app.include_router(ai_router, prefix="/api/ai", tags=["AI OCR"])
