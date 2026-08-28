# DailyLoop

A task management app built with React Native CLI (TypeScript) and an Express.js / MongoDB backend. Dark/light theming, Futura PT typography, Hugeicons, and native Android background alarm scheduling.

- **App ID**: `com.todoapp` · **Version**: 1.1.0 (build 2)
- **Backend**: `https://dailyloop-to-do-app.onrender.com/api` (Render)
- **Release APK**: `DailyLoop-v1.1.0.apk`

## Stack

- **App**: React Native CLI 0.74.3, TypeScript, React Navigation v6, Axios, AsyncStorage, `@react-native-community/datetimepicker`, Hugeicons
- **Backend**: Node/Express, MongoDB + Mongoose, JWT auth (`jsonwebtoken`, `bcryptjs`)
- **Android native**: `NotificationModule.java` (JS bridge), `AlarmReceiver.java` (background alarms via `AlarmManager`), `NotificationActionReceiver.java` (in-notification complete action)

## Features

- **Auth** — register/login, JWT sessions (30-day expiry), auto-logout on token expiry, edit profile, change password.
- **Tasks** — title, description, category (Work/Personal/Health/Study/Shopping/General), priority, scheduled time, deadline. Swipe left to delete (with confirmation), tap to mark complete.
- **Completed tasks** are visually dulled — muted background, strikethrough, lower opacity — so the active list stays scannable.
- **Grouping** — by category or by time of day (Morning 5–11:59am, Afternoon 12–4:59pm, Evening 5–8:59pm, Night 9pm–4:59am). 7-day date strip with relative labels (Today/Tomorrow/Yesterday).
- **Smart sort** — see algorithm below; overdue tasks always rank first, completed tasks always sink to the bottom.
- **Native alarms** — scheduled/deadline notifications fire via Android's `AlarmManager` even with the app closed, with wording adapted to the task title (e.g. "haircut" → "It's time for your haircut") and a Mark Complete action in the notification itself.
- **Calendar & insights** — month grid with activity indicators, day agenda, weekly completion chart.

## Sort algorithm

`src/utils/sortTasks.ts`:

```
urgency = hoursUntilDeadline + priorityPenalty + tiebreaker

priorityPenalty: high +0h, medium +6h, low +14h
tiebreaker: scheduled dateTime, for near-identical scores
```

Overdue tasks produce a negative `hoursUntilDeadline`, so they always sort to the top.

## Design tokens

`src/theme/colors.ts` — dark/light pairs for `background`, `surface`, `surfaceSecondary`, `border`, `textPrimary`, `textSecondary`; a shared `accent` (mint, `#38D9A9`) and per-category card colors (Work coral, Personal mint, Health yellow, Study blue, Shopping purple, General off-white). Completed cards switch to a muted surface regardless of category color.

Typography: Futura PT (Bold/Demi/Medium/Book/Regular/Light/Heavy), loaded as native font assets — set via `fontFamily` tokens only, no `fontWeight`, to avoid Android's synthetic-bold fallback.

## API reference

Base URL: `https://dailyloop-to-do-app.onrender.com/api`

**Auth** (`/auth`)
| Method | Endpoint | Auth | Body |
|---|---|---|---|
| POST | `/register` | – | `{ name, email, password }` |
| POST | `/login` | – | `{ email, password }` |
| GET | `/me` | ✓ | – |
| PUT | `/update-profile` | ✓ | `{ name, email }` |
| PUT | `/change-password` | ✓ | `{ currentPassword, newPassword }` |

**Tasks** (`/tasks`, all require auth)
| Method | Endpoint | Body |
|---|---|---|
| GET | `/` | – |
| POST | `/` | `{ title, description, category, priority, dateTime, deadline }` |
| PUT | `/:id` | Partial task fields |
| PATCH | `/:id/complete` | – (toggles completion) |
| DELETE | `/:id` | – |

`GET /health` returns `{ status, timestamp }`, no auth required.

## Project structure

```
TodoApp/
├── App.tsx
├── backend/
│   └── src/
│       ├── config/db.ts
│       ├── controllers/       # authController, taskController
│       ├── middleware/auth.ts # JWT guard
│       ├── models/            # User, Task
│       ├── routes/            # authRoutes, taskRoutes
│       ├── utils/generateToken.ts
│       └── server.ts
├── android/app/src/main/
│   ├── assets/fonts/          # Futura PT
│   └── java/com/todoapp/      # AlarmReceiver, NotificationModule, NotificationActionReceiver
└── src/
    ├── api/                   # client, authApi, taskApi
    ├── components/            # SwipeableTaskRow, FilterBar, TaskItem, Input, AppLogo
    ├── context/               # AuthContext, TaskContext
    ├── navigation/            # AppNavigator, MainTabNavigator
    ├── screens/                # Splash, Onboarding, Login, Register, Home,
    │                            # Insights, Calendar, Profile (+Edit), ChangePassword,
    │                            # AddEditTask
    ├── services/NotificationService.ts
    ├── theme/                 # colors, ThemeContext
    ├── types/
    └── utils/                 # relativeDate, sortTasks
```

## Running locally

**Prerequisites**: Node 18+, JDK 17/21, Android Studio (SDK 34), a MongoDB instance.

**Backend**
```bash
cd backend
npm install
```
Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/dailyloop
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=30d
```
```bash
npm run dev
```
Check `http://localhost:5000/api/health`.

**App**
```bash
npm install
npm run typecheck
npx react-native start        # terminal 1
adb reverse tcp:8081 tcp:8081 # terminal 2
adb reverse tcp:5000 tcp:5000
npx react-native run-android
```

**Production APK**
```bash
npm run build:android
```