from typing import Optional
from pydantic import BaseModel, Field

class UserModel(BaseModel):
    user_id: str
    username: str
    full_name: str
    role: str = "operator"  # admin, supervisor, operator, first_responder
    email: Optional[str] = None
    is_active: bool = True
