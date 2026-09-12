from fastapi import FastAPI

from app.api.task_routes import router


app = FastAPI(
    title="Task Manager API",
    description="Day 7 Clean Architecture Task Manager",
    version="1.0.0"
)


app.include_router(router)