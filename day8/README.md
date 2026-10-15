# Day 8 - React Task Manager (Frontend)

A Vite + React frontend with a registration page and a Task Manager home page.
It uses mock data and React state only. There is no FastAPI connection, real
authentication or database yet.

## Features
- Registration page (Username, Email ID, Password) with a purple/sea-blue background
- After registering, the Task Manager home page is shown
- Display, add, complete/uncomplete and delete tasks
- Empty-state message when there are no tasks

## Component structure
```
App
├── Register
└── Task Manager Home
    ├── TaskForm
    └── TaskList
        └── TaskItem
```

## React concepts demonstrated
Components, JSX, props, state (`useState`), `useEffect`, events, forms,
controlled components, lists and keys, conditional rendering, composition.

## Setup and run
```bash
npm install
npm run dev
```
Open the URL shown in the terminal (usually http://localhost:5173).

## Notes
- Put your illustration at `public/login-illustration.png`.
- Registration is frontend-only: submitting the form just stores the user in state.
