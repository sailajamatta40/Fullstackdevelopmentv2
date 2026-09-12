from app.repositories.task_repository import TaskRepository


class TaskService:

    def __init__(self):
        self.repository = TaskRepository()

    def create_task(self, title):
        return self.repository.create_task(title)

    def get_tasks(self):
        return self.repository.get_tasks()

    def get_task(self, task_id):
        return self.repository.get_task(task_id)

    def update_task(self, task_id, title, completed):
        return self.repository.update_task(
            task_id,
            title,
            completed
        )

    def delete_task(self, task_id):
        return self.repository.delete_task(task_id)