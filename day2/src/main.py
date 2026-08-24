from task_manager import TaskManager

manager = TaskManager()

while True:
    print("\n1. Add Task")
    print("2. List Tasks")
    print("3. Complete Task")
    print("4. Delete Task")
    print("5. Exit")

    choice = input("Choose: ")

    try:
        if choice == "1":
            manager.add_task(input("Enter task: "))

        elif choice == "2":
            manager.list_tasks()

        elif choice == "3":
            manager.complete_task(int(input("Task ID: ")))

        elif choice == "4":
            manager.delete_task(int(input("Task ID: ")))

        elif choice == "5":
            print("Goodbye!")
            break

        else:
            print("Invalid choice.")

    except ValueError:
        print("Enter a valid number.")
