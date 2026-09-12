from fastapi import APIRouter, HTTPException, status

from app.schemas.task import Task, TaskCreate, TaskUpdate
from app.services.task_service import TaskService


router = APIRouter()

service = TaskService()


@router.get("/tasks", response_model=list[Task])
def get_tasks():
    rows = service.get_tasks()

    return [
        {
            "id": row[0],
            "title": row[1],
            "completed": row[2]
        }
        for row in rows
    ]


@router.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int):
    row = service.get_task(task_id)

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


@router.post(
    "/tasks",
    response_model=Task,
    status_code=status.HTTP_201_CREATED
)
def create_task(task: TaskCreate):
    row = service.create_task(task.title)

    return {
        "id": row[0],
        "title": row[1],
        "completed": row[2]
    }


@router.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task: TaskUpdate):
    row = service.update_task(
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


@router.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    row = service.delete_task(task_id)

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return {
        "message": "Task deleted successfully"
    }