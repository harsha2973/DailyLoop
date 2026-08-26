# To-Do App — Backend API

Node.js + Express + TypeScript + MongoDB (Mongoose) REST API that powers the
React Native To-Do app. Handles user registration/login (JWT auth) and
per-user task CRUD.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev             # starts on http://localhost:5000 with auto-reload
```

Requires a running MongoDB instance — either local (`mongodb://127.0.0.1:27017/todo_app`)
or a free MongoDB Atlas cluster (paste its connection string into `MONGO_URI`).

Production build:

```bash
npm run build
npm start
```

## Project structure

```
src/
  config/db.ts           MongoDB connection
  models/                Mongoose schemas (User, Task)
  middleware/auth.ts      JWT verification ("protect" middleware)
  controllers/            Route handler logic
  routes/                 Express routers
  utils/generateToken.ts  JWT signing helper
  server.ts               App entry point
```

## API Reference

All request/response bodies are JSON. Authenticated routes require:
`Authorization: Bearer <token>`

### Auth

| Method | Endpoint             | Body                                | Notes                        |
|--------|-----------------------|--------------------------------------|-------------------------------|
| POST   | `/api/auth/register`  | `{ name, email, password }`          | Returns `{ user, token }`     |
| POST   | `/api/auth/login`     | `{ email, password }`                | Returns `{ user, token }`     |

### Tasks (all require auth)

| Method | Endpoint                    | Body / Query                                                        | Notes                        |
|--------|------------------------------|-----------------------------------------------------------------------|-------------------------------|
| GET    | `/api/tasks`                 | `?completed=true&priority=high&category=Work` (all optional)          | Sorted by soonest deadline    |
| POST   | `/api/tasks`                 | `{ title, description?, dateTime, deadline, priority?, category? }`   | `priority`: high/medium/low   |
| PUT    | `/api/tasks/:id`             | Any subset of task fields                                              | Full edit                     |
| PATCH  | `/api/tasks/:id/complete`    | —                                                                       | Toggles `completed`           |
| DELETE | `/api/tasks/:id`             | —                                                                       | Deletes the task               |

### Health check

`GET /api/health` → `{ status: "ok" }` (useful to confirm the mobile app can reach the server).

## Notes on connecting from the React Native app

- **Android emulator**: use `http://10.0.2.2:5000` as the API base URL (this
  maps to your machine's `localhost`).
- **Physical device**: use your computer's LAN IP, e.g. `http://192.168.1.50:5000`,
  and make sure the phone is on the same Wi-Fi network.
