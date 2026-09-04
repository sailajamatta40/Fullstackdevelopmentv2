# Day 6 - FastAPI + PostgreSQL Task Manager

## Project Description

This project is a Task Manager API built using FastAPI and PostgreSQL.

Day 6 connects the FastAPI application with PostgreSQL so that tasks are stored permanently in the database.

## Technologies Used

- Python
- FastAPI
- Uvicorn
- PostgreSQL
- Psycopg

## Database

Database Name:
task_manager_db

Table Name:
tasks

## API Endpoints

GET /tasks

GET /tasks/{task_id}

POST /tasks

PUT /tasks/{task_id}

DELETE /tasks/{task_id}

## How to Run

Activate the virtual environment:

.\venv\Scripts\Activate.ps1

Start the server:

python -m uvicorn src.main:app --reload

Open Swagger documentation:

http://127.0.0.1:8000/docs

## Day 6 Learning Outcomes

- Connected FastAPI with PostgreSQL
- Created a PostgreSQL database
- Created a tasks table
- Implemented CRUD operations
- Tested the API using Swagger UI
- Stored tasks permanently in PostgreSQL
