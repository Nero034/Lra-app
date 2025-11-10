import os, time
import jwt, bcrypt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET = os.getenv("SECRET_KEY", "change_this_secret")
ALGO = "HS256"
bearer = HTTPBearer()

def create_token(payload: dict, expire_seconds: int = 60*60):
    to_encode = payload.copy()
    to_encode.update({"exp": int(time.time()) + expire_seconds})
    return jwt.encode(to_encode, SECRET, algorithm=ALGO)

def verify_token(token: str):
    try:
        data = jwt.decode(token, SECRET, algorithms=[ALGO])
        return data
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    token = credentials.credentials
    return verify_token(token)
