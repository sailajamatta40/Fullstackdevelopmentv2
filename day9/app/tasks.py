
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.database import get_connection

router = APIRouter(prefix="/tasks", tags=["Tasks"])


class TaskCreate(BaseModel):
    user_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=500)


class TaskUpdate(BaseModel):
    user_id: int = Field(gt=0)
    title: str | None = Field(default=None, min_length=1, max_length=500)
    completed: bool | None = None
    important: bool | None = None


def task_dict(row):
    return {
        "id": row[0],
        "user_id": row[1],
        "title": row[2],
        "completed": row[3],
        "important": row[4],
    }


@router.get("/{user_id}")
def get_tasks(user_id: int):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, user_id, title, completed, important
                FROM tasks
                WHERE user_id = %s
                ORDER BY id DESC
                """,
                (user_id,),
            )
            rows = cursor.fetchall()
        return [task_dict(row) for row in rows]
    finally:
        connection.close()


@router.post("/")
def create_task(data: TaskCreate):
    title = data.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Task title is required.")

    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO tasks (user_id, title)
                SELECT id, %s FROM users WHERE id = %s
                RETURNING id, user_id, title, completed, important
                """,
                (title, data.user_id),
            )
            row = cursor.fetchone()

        if not row:
            connection.rollback()
            raise HTTPException(status_code=404, detail="User not found.")

        connection.commit()
        return task_dict(row)
    except HTTPException:
        raise
    except Exception:
        connection.rollback()
        raise HTTPException(status_code=500, detail="Could not save task.")
    finally:
        connection.close()


@router.put("/{task_id}")
def update_task(task_id: int, data: TaskUpdate):
    changes = data.model_dump(exclude={"user_id"}, exclude_unset=True)

    if not changes:
        raise HTTPException(status_code=400, detail="No task changes provided.")

    if "title" in changes:
        changes["title"] = changes["title"].strip()
        if not changes["title"]:
            raise HTTPException(status_code=400, detail="Task title is required.")

    allowed = {"title", "completed", "important"}
    assignments = []
    values = []

    for field, value in changes.items():
        if field not in allowed:
            continue
        assignments.append(f"{field} = %s")
        values.append(value)

    assignments.append("updated_at = CURRENT_TIMESTAMP")
    values.extend([task_id, data.user_id])

    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                f"""
                UPDATE tasks
                SET {", ".join(assignments)}
                WHERE id = %s AND user_id = %s
                RETURNING id, user_id, title, completed, important
                """,
                tuple(values),
            )
            row = cursor.fetchone()

        if not row:
            connection.rollback()
            raise HTTPException(status_code=404, detail="Task not found.")

        connection.commit()
        return task_dict(row)
    except HTTPException:
        raise
    except Exception:
        connection.rollback()
        raise HTTPException(status_code=500, detail="Could not update task.")
    finally:
        connection.close()


@router.delete("/{task_id}")
def delete_task(task_id: int, user_id: int):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM tasks
                WHERE id = %s AND user_id = %s
                RETURNING id
                """,
                (task_id, user_id),
            )
            deleted = cursor.fetchone()

        if not deleted:
            connection.rollback()
            raise HTTPException(status_code=404, detail="Task not found.")

        connection.commit()
        return {"message": "Task deleted successfully"}
    except HTTPException:
        raise
    except Exception:
        connection.rollback()
        raise HTTPException(status_code=500, detail="Could not delete task.")
    finally:
        connection.close()
