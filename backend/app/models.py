from pydantic import BaseModel
from typing import Optional

class LoginIn(BaseModel):
    username: str
    password: str

class ItemIn(BaseModel):
    quantidade: int = 1
    nome: str
    formula: Optional[str] = ""
    conteudo: Optional[str] = ""
    laboratorio: Optional[str] = ""
    validade: Optional[str] = ""
    preco_unitario: float = 0.0
    lista_origem: str = "Estoque"

class ProcessImageIn(BaseModel):
    image_base64: str
    lista_origem: Optional[str] = "Estoque"

class ListCreateIn(BaseModel):
    nome: str

class ConfigIn(BaseModel):
    openai_api_key: Optional[str] = None
    use_openai: Optional[bool] = None

class MoveIn(BaseModel):
    item_id: str
    quantidade: Optional[int] = None  # None = mover tudo
