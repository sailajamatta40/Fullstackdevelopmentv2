from app.database import get_connection


class TaskRepository:

    def create_task(self, title):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO tasks (title)
                    VALUES (%s)
                    RETURNING id, title, completed
                    """,
                    (title,)
                )
                return cur.fetchone()

    def get_tasks(self):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, title, completed
                    FROM tasks
                    ORDER BY id
                    """
                )
                return cur.fetchall()

    def get_task(self, task_id):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, title, completed
                    FROM tasks
                    WHERE id = %s
                    """,
                    (task_id,)
                )
                return cur.fetchone()

    def update_task(self, task_id, title, completed):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE tasks
                    SET title = %s, completed = %s
                    WHERE id = %s
                    RETURNING id, title, completed
                    """,
                    (title, completed, task_id)
                )
                return cur.fetchone()

    def delete_task(self, task_id):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    DELETE FROM tasks
                    WHERE id = %s
                    RETURNING id
                    """,
                    (task_id,)
                )
                return cur.fetchone()