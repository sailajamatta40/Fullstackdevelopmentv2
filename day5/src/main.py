from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

from src.task_manager import TaskManager


app = FastAPI(
    title="Task Manager API",
    description="Day 5 FastAPI Task Manager",
    version="1.0.0"
)

manager = TaskManager()


class TaskCreate(BaseModel):
    title: str


class TaskUpdate(BaseModel):
    title: str
    completed: bool


class TaskResponse(BaseModel):
    task_id: int
    title: str
    completed: bool


@app.get("/tasks", response_model=list[TaskResponse])
def get_tasks():
    return manager.get_all_tasks()


@app.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int):
    task = manager.find_task(task_id)

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task



@app.post(
    "/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED
)
def create_task(task: TaskCreate):
    return manager.add_task(task.title)


@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskUpdate):
    updated_task = manager.update_task(
        task_id,
        task.title,
        task.completed
    )

    if updated_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return updated_task


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    deleted = manager.delete_task(task_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return {"message": "Task deleted successfully"}