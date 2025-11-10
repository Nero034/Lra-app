import os, datetime
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/remedios")
client = AsyncIOMotorClient(MONGO_URI)
db = client.get_default_database() if "/" in MONGO_URI else client.get_database("remedios")
items_col = db.get_collection("items")
users_col = db.get_collection("users")
lists_col = db.get_collection("lists")
config_col = db.get_collection("config")
login_col = db.get_collection("login_attempts")

async def ensure_defaults():
    # Usuário padrão
    user = await users_col.find_one({"username": "caiogb65"})
    if not user:
        import bcrypt
        hashed = bcrypt.hashpw("2508".encode(), bcrypt.gensalt()).decode()
        await users_col.insert_one({
            "username": "caiogb65",
            "password": hashed,
            "created_at": datetime.datetime.utcnow()
        })
    # Planilhas fixas
    for fixed in ["Estoque", "Retiradas", "Saídas"]:
        if not await lists_col.find_one({"nome": fixed, "fixa": True}):
            await lists_col.insert_one({"nome": fixed, "fixa": True, "created_at": datetime.datetime.utcnow()})
    # Config
    if not await config_col.find_one({"_id": "app"}):
        from os import getenv
        await config_col.insert_one({"_id": "app", "USE_OPENAI": True, "OPENAI_API_KEY": getenv("OPENAI_API_KEY","")})
