from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1, max_length=255)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: str | None = None
    is_active: bool
    is_verified: bool
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
