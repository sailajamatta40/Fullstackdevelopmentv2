
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import get_connection
from app.users import router as users_router
from app.tasks import router as tasks_router

app = FastAPI(
    title="DOKI Task Manager API",
    version="1.0.0",
)

# Allow the React development server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(users_router)
app.include_router(tasks_router)


@app.get("/")
def root():
    return {
        "message": "DOKI Task Manager API is running"
    }


@app.get("/db-test")
def database_test():
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()

        return {
            "message": "PostgreSQL connection successful",
            "result": result[0],
        }

    finally:
        connection.close()
