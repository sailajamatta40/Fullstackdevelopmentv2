from fastapi import FastAPI, HTTPException, status

from .models import Task, TaskCreate, TaskUpdate
from .task_manager import TaskManager


app = FastAPI(
    title="Task Manager API",
    description="Day 6 FastAPI + PostgreSQL Task Manager",
    version="1.0.0"
)

manager = TaskManager()


@app.get("/tasks", response_model=list[Task])
def get_tasks():
    rows = manager.get_tasks()

    return [
        {
            "id": row[0],
            "title": row[1],
            "completed": row[2]
        }
        for row in rows
    ]


@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int):
    row = manager.get_task(task_id)

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return {
        "id": row[0],
        "title": row[1],
        "completed": row[2]
    }


@app.post(
    "/tasks",
    response_model=Task,
    status_code=status.HTTP_201_CREATED
)
def create_task(task: TaskCreate):
    row = manager.create_task(task.title)

    return {
        "id": row[0],
        "title": row[1],
        "completed": row[2]
    }


@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task: TaskUpdate):
    row = manager.update_task(
        task_id,
        task.title,
        task.completed
    )

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return {
        "id": row[0],
        "title": row[1],
        "completed": row[2]
    }


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    row = manager.delete_task(task_id)

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return {
        "message": "Task deleted successfully"
    }