import psycopg


def get_connection():
    return psycopg.connect(
        host="localhost",
        port=5432,
        dbname="task_manager_db",
        user="postgres",
        password="S@ilu2108"
    )