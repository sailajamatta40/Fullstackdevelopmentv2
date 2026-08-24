# Day 2 — Python Task Manager

A simple command-line Task Manager built with Python as part of the Full Stack Development learning journey.

## Overview

This project focuses on building a small Python application using classes, methods, lists, and basic object-oriented programming concepts.

Tasks are stored in memory while the application is running.

## Features

- Add a new task
- List all tasks
- Mark a task as completed
- Delete a task
- Exit the application
- Automatically assign a unique ID to each task

## Application Structure

```mermaid
flowchart TD
    A[User] --> B[main.py]
    B --> C[TaskManager]
    C --> D[Task]
    D --> E[Task Data]

    C --> F[Add Task]
    C --> G[List Tasks]
    C --> H[Get Task]
    C --> I[Update Task]
    C --> J[Delete Task]