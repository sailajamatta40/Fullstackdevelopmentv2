from task import Task


class TaskManager:

    def __init__(self):
        self.tasks = []
        self.next_id = 1

    def add_task(self, title: str):
        task = Task(self.next_id, title)
        self.tasks.append(task)
        self.next_id += 1
        print("Task added successfully!")

    def list_tasks(self):
        if not self.tasks:
            print("\nNo tasks available.")
            return

        print("\n===== YOUR TASKS =====")

        for task in self.tasks:
            print(task)

    def complete_task(self, task_id: int):
        task = self.find_task(task_id)

        if task:
            task.mark_completed()
            print("Task completed successfully!")
        else:
            print("Task not found.")

    def delete_task(self, task_id: int):
        task = self.find_task(task_id)

        if task:
            self.tasks.remove(task)
            print("Task deleted successfully!")
        else:
            print("Task not found.")

    def find_task(self, task_id: int):
        for task in self.tasks:
            if task.task_id == task_id:
                return task

        return None
