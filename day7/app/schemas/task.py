from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str


class TaskUpdate(BaseModel):
    title: str
    completed: bool


class Task(BaseModel):
    id: int
    title: str
    completed: bool