# LRA App — Web (React + FastAPI + MongoDB + OpenAI)

## Backend (FastAPI)
- Pasta: `backend`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Variáveis: `OPENAI_API_KEY`, `SECRET_KEY`, `MONGO_URI`, `PORT=8000`, `FRONTEND_ORIGIN` (opcional)

## Frontend (React + Vite)
- Pasta: `frontend`
- Var: `VITE_API_URL` apontando para o backend

## Login padrão
- Usuário: `caiogb65`
- Senha: `2508`

## Planilhas fixas
- **Estoque** (agregadora; itens ativos)
- **Retiradas** (baixas/ajustes; baixa do Estoque)
- **Saídas** (vendas; baixa do Estoque)

Sessão expira por inatividade de 30 minutos (frontend).
