from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta, datetime
from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse, ChangePassword
from app.core.security import get_password_hash, verify_password, create_access_token
from app.services.email_service import email_service

router = APIRouter(prefix="/auth", tags=["auth"])

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db), background_tasks: BackgroundTasks = BackgroundTasks()):
    try:
        result = await db.execute(select(User).where(User.email == user_data.email))
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        password_hash = get_password_hash(user_data.password)
        user = User(
            email=user_data.email,
            password_hash=password_hash,
            full_name=user_data.full_name,
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Generate access token for immediate login
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.id}, expires_delta=access_token_expires
        )

        # Send welcome email in background
        async def send_welcome_email():
            try:
                email_content = email_service.welcome_email(user.full_name)
                await email_service.send_email(
                    to_email=user.email,
                    subject="Welcome to SKYRA!",
                    html_content=email_content
                )
            except Exception as e:
                from app.core.logging import logger
                logger.error(f"Failed to send welcome email to {user.email}: {str(e)}", exc_info=True)

        background_tasks.add_task(send_welcome_email)

        return Token(access_token=access_token, user=user)
    except HTTPException:
        raise
    except Exception as e:
        from app.core.logging import logger
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db), background_tasks: BackgroundTasks = BackgroundTasks()):
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )

    # Send login notification email in background (non-blocking)
    async def send_login_notification():
        try:
            login_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            email_content = email_service.login_notification(user.full_name, login_time)
            await email_service.send_email(
                to_email=user.email,
                subject="Welcome Back to SKYRA — Login Successful",
                html_content=email_content
            )
        except Exception as e:
            from app.core.logging import logger
            logger.error(f"Login notification email failed for user {user.email}: {str(e)}", exc_info=True)

    background_tasks.add_task(send_login_notification)

    return Token(access_token=access_token, user=user)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/change-password")
async def change_password(
    password_data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Verify current password
        if not verify_password(password_data.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Update password
        current_user.password_hash = get_password_hash(password_data.new_password)
        await db.commit()
        await db.refresh(current_user)
        
        return {"message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        from app.core.logging import logger
        logger.error(f"Password change error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password change failed: {str(e)}"
        )
