from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# --- USER SCHEMAS ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    college_org: Optional[str] = None

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    college_org: Optional[str] = None
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- AUTHENTICATION SCHEMAS ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None
