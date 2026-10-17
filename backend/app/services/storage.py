import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException


class StorageAdapter:
    """Base storage adapter interface"""
    
    async def save_file(self, file: UploadFile, user_id: str) -> str:
        """Save file and return the file URL/path"""
        raise NotImplementedError
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete file by path"""
        raise NotImplementedError
    
    async def get_file_url(self, file_path: str) -> str:
        """Get public URL for file"""
        raise NotImplementedError


class LocalStorageAdapter(StorageAdapter):
    """Local file storage adapter for development"""
    
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_safe_filename(self, original_filename: str, user_id: str) -> str:
        """Generate safe filename using UUID and user ID"""
        file_ext = Path(original_filename).suffix
        safe_filename = f"{user_id}_{uuid.uuid4()}{file_ext}"
        return safe_filename
    
    async def save_file(self, file: UploadFile, user_id: str) -> str:
        """Save file to local storage"""
        safe_filename = self._get_safe_filename(file.filename or "upload", user_id)
        file_path = self.upload_dir / safe_filename
        
        try:
            contents = await file.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            return str(file_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete file from local storage"""
        try:
            path = Path(file_path)
            if path.exists():
                path.unlink()
                return True
            return False
        except Exception:
            return False
    
    async def get_file_url(self, file_path: str) -> str:
        """Return file path as URL (for local dev)"""
        return file_path


class StorageService:
    """Storage service with adapter pattern"""
    
    def __init__(self, adapter: Optional[StorageAdapter] = None):
        self.adapter = adapter or LocalStorageAdapter()
    
    async def save_file(self, file: UploadFile, user_id: str) -> str:
        """Save file using configured adapter"""
        return await self.adapter.save_file(file, user_id)
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete file using configured adapter"""
        return await self.adapter.delete_file(file_path)
    
    async def get_file_url(self, file_path: str) -> str:
        """Get file URL using configured adapter"""
        return await self.adapter.get_file_url(file_path)


# Global storage service instance
storage_service = StorageService()
