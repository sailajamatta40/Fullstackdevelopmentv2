class Task:
    def __init__(self, task_id: int, title: str):
        self.task_id = task_id
        self.title = title
        self.completed = False

    def mark_completed(self):
        self.completed = True

    def __str__(self):
        if self.completed:
            status = "[✓] Completed"
        else:
            status = "[...] Pending"

        return f"{self.task_id}. {self.title} - {status}"
