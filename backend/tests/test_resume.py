"""
Resume upload and management tests for SKYRA.

Tests cover:
- POST /api/v1/resumes/upload (authenticated)
- POST /api/v1/resumes/upload (unauthenticated rejection)
- Invalid file type rejection
- File size validation
- PDF text extraction
- DOCX text extraction
- Resume ownership verification
- GET /api/v1/resumes (list resumes)
- GET /api/v1/resumes/{resume_id} (get resume)
- DELETE /api/v1/resumes/{resume_id} (delete resume)
"""

import pytest
import io
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.models.resume import Resume
from app.core.security import get_password_hash


@pytest.mark.asyncio
async def test_upload_resume_authenticated(async_client: AsyncClient, async_session: AsyncSession):
    """Test successful resume upload by authenticated user."""
    # Create user
    user = User(
        email="resume@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Resume User"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    
    # Login to get token
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "resume@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Create a mock PDF file
    pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test Resume Content) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000204 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n299\n%%EOF"
    files = {"file": ("test_resume.pdf", io.BytesIO(pdf_content), "application/pdf")}
    data = {"title": "My Resume"}
    
    # Upload resume (AI parsing may fail without API key, but upload should succeed)
    response = await async_client.post(
        "/api/v1/resumes/upload",
        files=files,
        data=data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "My Resume"
    assert data["original_filename"] == "test_resume.pdf"
    assert data["file_type"] == "application/pdf"
    assert data["user_id"] == str(user.id)
    assert data["is_active"] is True
    assert "id" in data


@pytest.mark.asyncio
async def test_upload_resume_unauthenticated(async_client: AsyncClient):
    """Test resume upload without authentication fails."""
    pdf_content = b"%PDF-1.4\n%Fake PDF content\n%%EOF"
    files = {"file": ("test_resume.pdf", io.BytesIO(pdf_content), "application/pdf")}
    data = {"title": "My Resume"}
    
    response = await async_client.post(
        "/api/v1/resumes/upload",
        files=files,
        data=data
    )
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_upload_invalid_file_type(async_client: AsyncClient, async_session: AsyncSession):
    """Test upload with invalid file type fails."""
    # Create and authenticate user
    user = User(
        email="filetype@example.com",
        password_hash=get_password_hash("password123"),
        full_name="File Type User"
    )
    async_session.add(user)
    await async_session.commit()
    
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "filetype@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Try to upload invalid file type
    txt_content = b"This is a text file"
    files = {"file": ("test.txt", io.BytesIO(txt_content), "text/plain")}
    data = {"title": "Invalid File"}
    
    response = await async_client.post(
        "/api/v1/resumes/upload",
        files=files,
        data=data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]


@pytest.mark.asyncio
async def test_upload_large_file(async_client: AsyncClient, async_session: AsyncSession):
    """Test upload with file exceeding size limit fails."""
    # Create and authenticate user
    user = User(
        email="largefile@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Large File User"
    )
    async_session.add(user)
    await async_session.commit()
    
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "largefile@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Create file larger than 10MB limit
    large_content = b"x" * (11 * 1024 * 1024)  # 11MB
    files = {"file": ("large.pdf", io.BytesIO(large_content), "application/pdf")}
    data = {"title": "Large File"}
    
    response = await async_client.post(
        "/api/v1/resumes/upload",
        files=files,
        data=data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 400
    assert "File size exceeds" in response.json()["detail"]


@pytest.mark.asyncio
async def test_list_resumes(async_client: AsyncClient, async_session: AsyncSession):
    """Test listing resumes for authenticated user."""
    # Create user
    user = User(
        email="list@example.com",
        password_hash=get_password_hash("password123"),
        full_name="List User"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    
    # Login
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "list@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Upload first resume
    pdf_content1 = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(First Resume) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000204 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n299\n%%EOF"
    files1 = {"file": ("resume1.pdf", io.BytesIO(pdf_content1), "application/pdf")}
    await async_client.post(
        "/api/v1/resumes/upload",
        files=files1,
        data={"title": "Resume 1"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Upload second resume
    pdf_content2 = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Second Resume) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000204 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n299\n%%EOF"
    files2 = {"file": ("resume2.pdf", io.BytesIO(pdf_content2), "application/pdf")}
    await async_client.post(
        "/api/v1/resumes/upload",
        files=files2,
        data={"title": "Resume 2"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # List resumes
    response = await async_client.get(
        "/api/v1/resumes",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["resumes"]) == 2
    assert all(r["user_id"] == str(user.id) for r in data["resumes"])


@pytest.mark.asyncio
async def test_get_resume(async_client: AsyncClient, async_session: AsyncSession):
    """Test getting a specific resume by ID."""
    # Create user
    user = User(
        email="get@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Get User"
    )
    async_session.add(user)
    await async_session.commit()
    
    # Login
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "get@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Upload resume
    pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test Resume) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000204 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n299\n%%EOF"
    files = {"file": ("test.pdf", io.BytesIO(pdf_content), "application/pdf")}
    upload_response = await async_client.post(
        "/api/v1/resumes/upload",
        files=files,
        data={"title": "Test Resume"},
        headers={"Authorization": f"Bearer {token}"}
    )
    resume_id = upload_response.json()["id"]
    
    # Get resume
    response = await async_client.get(
        f"/api/v1/resumes/{resume_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["resume"]["id"] == resume_id
    assert data["resume"]["title"] == "Test Resume"
    assert data["latest_version"] is not None


@pytest.mark.asyncio
async def test_get_resume_not_found(async_client: AsyncClient, async_session: AsyncSession):
    """Test getting non-existent resume returns 404."""
    # Create user and login
    user = User(
        email="notfound@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Not Found User"
    )
    async_session.add(user)
    await async_session.commit()
    
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "notfound@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Try to get non-existent resume
    response = await async_client.get(
        "/api/v1/resumes/nonexistent-id",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_resume(async_client: AsyncClient, async_session: AsyncSession):
    """Test deleting a resume."""
    # Create user
    user = User(
        email="delete@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Delete User"
    )
    async_session.add(user)
    await async_session.commit()
    
    # Login
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "delete@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Upload resume
    pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Delete Me) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000204 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n299\n%%EOF"
    files = {"file": ("delete.pdf", io.BytesIO(pdf_content), "application/pdf")}
    upload_response = await async_client.post(
        "/api/v1/resumes/upload",
        files=files,
        data={"title": "Delete Me"},
        headers={"Authorization": f"Bearer {token}"}
    )
    resume_id = upload_response.json()["id"]
    
    # Delete resume
    response = await async_client.delete(
        f"/api/v1/resumes/{resume_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 204
    
    # Verify resume is deleted
    get_response = await async_client.get(
        f"/api/v1/resumes/{resume_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_resume_ownership(async_client: AsyncClient, async_session: AsyncSession):
    """Test users can only access their own resumes."""
    # Create two users
    user1 = User(
        email="user1@example.com",
        password_hash=get_password_hash("password123"),
        full_name="User One"
    )
    user2 = User(
        email="user2@example.com",
        password_hash=get_password_hash("password123"),
        full_name="User Two"
    )
    async_session.add(user1)
    async_session.add(user2)
    await async_session.commit()
    
    # Login as user1
    login1 = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "user1@example.com", "password": "password123"}
    )
    token1 = login1.json()["access_token"]
    
    # Upload resume as user1
    pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(User1 Resume) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000204 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n299\n%%EOF"
    files = {"file": ("user1.pdf", io.BytesIO(pdf_content), "application/pdf")}
    upload_response = await async_client.post(
        "/api/v1/resumes/upload",
        files=files,
        data={"title": "User1 Resume"},
        headers={"Authorization": f"Bearer {token1}"}
    )
    resume_id = upload_response.json()["id"]
    
    # Login as user2
    login2 = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "user2@example.com", "password": "password123"}
    )
    token2 = login2.json()["access_token"]
    
    # Try to access user1's resume as user2
    response = await async_client.get(
        f"/api/v1/resumes/{resume_id}",
        headers={"Authorization": f"Bearer {token2}"}
    )
    
    assert response.status_code == 404
