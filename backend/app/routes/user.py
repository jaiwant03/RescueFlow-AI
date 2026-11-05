import logging
from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.database import get_database, clean_mongo_doc

logger = logging.getLogger("rescueflow.routes.user")
router = APIRouter(prefix="/api/user", tags=["User Profile"])

class UserProfilePayload(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    name: str = "Operator"
    email: Optional[str] = "operator@rescueflow.ai"
    role: Optional[str] = "Operations Commander"
    department: Optional[str] = "Disaster Operations Command (HQ)"
    callsign: Optional[str] = "COMMAND-1"
    badge: Optional[str] = "EOC-7701"
    photo: Optional[str] = None  # Base64 data URI or image URL
    password: Optional[str] = None

class PhotoUploadPayload(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None
    photo: str  # Base64 data URI or image URL

@router.get("/profile")
async def get_user_profile(email: Optional[str] = None, user_id: Optional[str] = None):
    """
    Retrieves the persistent operator profile and photo from MongoDB Atlas.
    """
    db = get_database()
    query = {}
    if email:
        query["email"] = email.strip().lower()
    elif user_id:
        query["$or"] = [{"id": user_id}, {"user_id": user_id}]
    
    user_doc = None
    if query:
        user_doc = await db["users"].find_one(query)
    
    # Fallback to the most recently updated operator profile in Atlas
    if not user_doc:
        cursor = db["users"].find({}).sort("updated_at", -1).limit(1)
        users = await cursor.to_list(1)
        if users:
            user_doc = users[0]
            
    if not user_doc:
        # Default fallback profile
        return {
            "name": "Operations Commander",
            "email": "commander@rescueflow.ai",
            "role": "Operations Commander",
            "department": "Disaster Operations Command (HQ)",
            "callsign": "COMMAND-1",
            "badge": "EOC-7701",
            "photo": None,
            "created_at": datetime.utcnow().isoformat()
        }
        
    return clean_mongo_doc(user_doc)

@router.post("/profile")
async def save_user_profile(payload: UserProfilePayload):
    """
    Persists operator profile and photo permanently in MongoDB Atlas users collection.
    """
    db = get_database()
    now_iso = datetime.utcnow().isoformat()
    
    clean_email = (payload.email or "operator@rescueflow.ai").strip().lower()
    uid = payload.id or payload.user_id or f"user-{clean_email}"
    
    doc_data = {
        "id": uid,
        "user_id": uid,
        "name": payload.name.strip(),
        "email": clean_email,
        "role": payload.role or "Operations Commander",
        "department": payload.department or "Disaster Operations Command (HQ)",
        "callsign": payload.callsign or "COMMAND-1",
        "badge": payload.badge or "EOC-7701",
        "photo": payload.photo,
        "updated_at": now_iso
    }
    
    # Upsert by email or id
    match_query = {
        "$or": [
            {"email": clean_email},
            {"id": uid},
            {"user_id": uid}
        ]
    }
    
    existing = await db["users"].find_one(match_query)
    if existing:
        # Preserve created_at
        doc_data["created_at"] = existing.get("created_at", now_iso)
        await db["users"].update_one(match_query, {"$set": doc_data})
    else:
        doc_data["created_at"] = now_iso
        await db["users"].insert_one(doc_data)
        
    logger.info(f"Persisted operator profile for '{payload.name}' ({clean_email}) to MongoDB Atlas. Photo length: {len(payload.photo) if payload.photo else 0}")
    return {"success": True, "message": "Profile and photo saved to MongoDB Atlas", "user": clean_mongo_doc(doc_data)}

@router.post("/photo")
async def update_user_photo(payload: PhotoUploadPayload):
    """
    Dedicated endpoint to update operator photo in MongoDB Atlas.
    """
    db = get_database()
    now_iso = datetime.utcnow().isoformat()
    
    clean_email = (payload.email or "").strip().lower()
    match_query = {}
    if clean_email:
        match_query["email"] = clean_email
    elif payload.user_id:
        match_query["$or"] = [{"id": payload.user_id}, {"user_id": payload.user_id}]
    else:
        # Default to first/active user
        match_query = {}
        
    existing = await db["users"].find_one(match_query) if match_query else None
    if not existing:
        cursor = db["users"].find({}).sort("updated_at", -1).limit(1)
        users = await cursor.to_list(1)
        if users:
            existing = users[0]
            match_query = {"_id": existing["_id"]}

    if existing:
        await db["users"].update_one(match_query, {"$set": {"photo": payload.photo, "updated_at": now_iso}})
    else:
        # Insert a new record
        await db["users"].insert_one({
            "id": payload.user_id or "user-default",
            "name": "Operations Commander",
            "email": clean_email or "commander@rescueflow.ai",
            "role": "Operations Commander",
            "department": "Disaster Operations Command (HQ)",
            "photo": payload.photo,
            "created_at": now_iso,
            "updated_at": now_iso
        })
        
    logger.info(f"Updated operator photo in MongoDB Atlas (length: {len(payload.photo)})")
    return {"success": True, "photo": payload.photo}
