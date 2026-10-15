import hashlib
import logging
import os
import secrets
import smtplib
import ssl
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext
from google.oauth2 import id_token
from google.auth.transport import requests

from app.database import get_connection

load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
FRONTEND_URL = os.getenv(
    "FRONTEND_URL", "http://localhost:5173"
).rstrip("/")

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")


# -------------------- REQUEST MODELS --------------------

class RegisterRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    credential: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6, max_length=72)


# -------------------- EMAIL HELPER --------------------

def send_reset_email(email: str, reset_link: str) -> None:
    """Send the time-limited password reset link."""

    required_settings = [
        SMTP_HOST,
        SMTP_USERNAME,
        SMTP_PASSWORD,
        SMTP_FROM_EMAIL,
    ]

    if not all(required_settings):
        raise RuntimeError(
            "Password-reset SMTP settings are incomplete."
        )

    message = EmailMessage()
    message["Subject"] = "DOKI Password Reset"
    message["From"] = SMTP_FROM_EMAIL
    message["To"] = email

    message.set_content(
        f"""Hello,

We received a request to reset your DOKI password.

Use the following link to choose a new password:

{reset_link}

This link expires in 10 minutes and can be used only once.

If you did not request a password reset, you can ignore this email.

DOKI Task Manager
"""
    )

    context = ssl.create_default_context()

    with smtplib.SMTP(
        SMTP_HOST, SMTP_PORT, timeout=20
    ) as server:
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(message)


# -------------------- REGISTER --------------------

@router.post("/register")
def register(data: RegisterRequest):
    username = data.username.strip()
    email = str(data.email).strip().lower()

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Username is required.",
        )

    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id
                FROM users
                WHERE LOWER(username) = LOWER(%s)
                   OR LOWER(email) = LOWER(%s)
                """,
                (username, email),
            )

            if cursor.fetchone():
                raise HTTPException(
                    status_code=409,
                    detail="Username or email already exists.",
                )

            password_hash = pwd_context.hash(data.password)

            cursor.execute(
                """
                INSERT INTO users
                    (username, email, password_hash)
                VALUES (%s, %s, %s)
                RETURNING id, username, email
                """,
                (username, email, password_hash),
            )

            user = cursor.fetchone()

        connection.commit()

        return {
            "message": "Registration successful.",
            "user": {
                "id": user[0],
                "username": user[1],
                "email": user[2],
            },
        }

    except HTTPException:
        connection.rollback()
        raise
    except Exception:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail="Registration failed.",
        )
    finally:
        connection.close()


# -------------------- LOGIN --------------------

@router.post("/login")
def login(data: LoginRequest):
    email = str(data.email).strip().lower()

    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, username, email, password_hash
                FROM users
                WHERE LOWER(email) = LOWER(%s)
                """,
                (email,),
            )

            user = cursor.fetchone()

        if (
            not user
            or not user[3]
            or not pwd_context.verify(data.password, user[3])
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password.",
            )

        return {
            "message": "Login successful.",
            "user": {
                "id": user[0],
                "username": user[1],
                "email": user[2],
            },
        }

    finally:
        connection.close()


# -------------------- GOOGLE LOGIN --------------------

@router.post("/google")
def google_login(data: GoogleLoginRequest):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="Google login is not configured.",
        )

    try:
        google_user = id_token.verify_oauth2_token(
            data.credential,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Google sign-in verification failed.",
        )

    google_sub = google_user.get("sub")
    email = google_user.get("email", "").strip().lower()
    email_verified = google_user.get("email_verified", False)

    if not google_sub or not email or not email_verified:
        raise HTTPException(
            status_code=401,
            detail="A verified Google email is required.",
        )

    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, username, email, google_sub
                FROM users
                WHERE LOWER(email) = LOWER(%s)
                """,
                (email,),
            )

            user = cursor.fetchone()

            # This endpoint links Google to an existing account.
            if not user:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        "No DOKI account exists for this email. "
                        "Register first."
                    ),
                )

            if user[3] and user[3] != google_sub:
                raise HTTPException(
                    status_code=409,
                    detail="This account is linked to another Google account.",
                )

            cursor.execute(
                """
                UPDATE users
                SET google_sub = %s
                WHERE id = %s
                """,
                (google_sub, user[0]),
            )

        connection.commit()

        return {
            "message": "Google login successful.",
            "user": {
                "id": user[0],
                "username": user[1],
                "email": user[2],
            },
        }

    except HTTPException:
        connection.rollback()
        raise
    except Exception:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail="Google login failed.",
        )
    finally:
        connection.close()


# -------------------- FORGOT PASSWORD --------------------

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest):
    email = str(data.email).strip().lower()

    # Return the same response whether the account exists or not.
    generic_response = {
        "message": (
            "If an account exists for that email, "
            "a password-reset link will be sent."
        )
    }

    connection = get_connection()
    token_hash = None

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, email
                FROM users
                WHERE LOWER(email) = LOWER(%s)
                """,
                (email,),
            )
            user = cursor.fetchone()

            if not user:
                return generic_response

            user_id, registered_email = user

            # Invalidate older, unused links for this account.
            cursor.execute(
                """
                UPDATE password_reset_tokens
                SET used_at = CURRENT_TIMESTAMP
                WHERE user_id = %s
                  AND used_at IS NULL
                """,
                (user_id,),
            )

            # The raw token goes only into the email.
            # Store only its SHA-256 hash in the database.
            raw_token = secrets.token_urlsafe(32)
            token_hash = hashlib.sha256(
                raw_token.encode("utf-8")
            ).hexdigest()

            expires_at = (
                datetime.now(timezone.utc)
                + timedelta(minutes=10)
            )

            cursor.execute(
                """
                INSERT INTO password_reset_tokens
                    (user_id, token_hash, expires_at)
                VALUES (%s, %s, %s)
                """,
                (user_id, token_hash, expires_at),
            )

        connection.commit()

        reset_link = (
            f"{FRONTEND_URL}/?resetToken={raw_token}"
        )

        try:
            send_reset_email(
                registered_email,
                reset_link,
            )
        except Exception:
            logger.exception("DOKI password-reset email sending failed")
            # Do not leave a valid token behind if email delivery fails.
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE password_reset_tokens
                    SET used_at = CURRENT_TIMESTAMP
                    WHERE token_hash = %s
                      AND used_at IS NULL
                    """,
                    (token_hash,),
                )
            connection.commit()

            # Keep the response generic.
            return generic_response

        return generic_response

    except Exception:
        logger.exception("DOKI forgot-password request failed")
        connection.rollback()
        return generic_response
    finally:
        connection.close()


# -------------------- RESET PASSWORD --------------------

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    raw_token = data.token.strip()

    if not raw_token:
        raise HTTPException(
            status_code=400,
            detail="Reset link is invalid or expired.",
        )

    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            # Lock the token row so simultaneous requests cannot
            # successfully use the same reset link twice.
            cursor.execute(
                """
                SELECT id, user_id
                FROM password_reset_tokens
                WHERE token_hash = %s
                  AND used_at IS NULL
                  AND expires_at > CURRENT_TIMESTAMP
                FOR UPDATE
                """,
                (token_hash,),
            )

            token_row = cursor.fetchone()

            if not token_row:
                raise HTTPException(
                    status_code=400,
                    detail="Reset link is invalid or expired.",
                )

            token_id, user_id = token_row

            new_password_hash = pwd_context.hash(
                data.new_password
            )

            cursor.execute(
                """
                UPDATE users
                SET password_hash = %s
                WHERE id = %s
                """,
                (new_password_hash, user_id),
            )

            if cursor.rowcount != 1:
                raise HTTPException(
                    status_code=400,
                    detail="Unable to reset password.",
                )

            cursor.execute(
                """
                UPDATE password_reset_tokens
                SET used_at = CURRENT_TIMESTAMP
                WHERE id = %s
                """,
                (token_id,),
            )

        connection.commit()

        return {
            "message": (
                "Password reset successful. "
                "Please log in with your new password."
            )
        }

    except HTTPException:
        connection.rollback()
        raise
    except Exception:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail="Password reset failed. Please try again.",
        )
    finally:
        connection.close()