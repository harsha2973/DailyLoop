# ♾️ DailyLoop Productivity Suite

> **Plan less. Do more.**

**DailyLoop** is a production-grade, full-stack mobile productivity application engineered with **React Native CLI (TypeScript)** and a companion **Express.js / Node.js / MongoDB** backend. Built around a minimal visual language, Futura PT typography, Hugeicons stroke vectors, and native Android background alarm scheduling, DailyLoop reduces task management friction through dynamic task grouping, intelligent urgency sorting, real-time analytics, and gesture-driven interactions.

---

## 📋 Table of Contents
1. [📱 Production Branding & Release Artifacts](#-production-branding--release-artifacts)
2. [🧰 Technology Stack Overview](#-technology-stack-overview)
3. [🖥️ Backend Architecture & Database Specification](#️-backend-architecture--database-specification)
4. [📡 Complete REST API Endpoint Specification](#-complete-rest-api-endpoint-specification)
5. [📱 Mobile Frontend Architecture & Navigation](#-mobile-frontend-architecture--navigation)
6. [🎨 Design System, Color Tokens & Typography](#-design-system-color-tokens--typography)
7. [⚡ Core UI/UX Capabilities & Gesture Systems](#-core-uiux-capabilities--gesture-systems)
8. [🔔 Native Android AlarmManager & Notification Engine](#-native-android-alarmmanager--notification-engine)
9. [🧮 Smart Urgency Sorting Algorithm](#-smart-urgency-sorting-algorithm)
10. [📂 Repository Directory Structure & File Map](#-repository-directory-structure--file-map)
11. [🛠️ Local Installation, Environment Setup & Deployment](#️-local-installation-environment-setup--deployment)

---

## 📱 Production Branding & Release Artifacts

- **App Name**: **Daily Loop**
- **App Launcher Icon**: Minimalist **Black & White Infinity Symbol** ($\infty$)
- **App Package ID**: `com.todoapp`
- **Production App Version**: `1.1.0` (Build Version Code `2`)
- **Backend API Base URL**: `https://dailyloop-to-do-app.onrender.com/api` (Hosted on Render Cloud)
- **Standalone Release APK**: [`DailyLoop-v1.1.0.apk`](file:///c:/Users/Harsha%20Gowda/Desktop/TO-DO%20List/TodoApp/DailyLoop-v1.1.0.apk) (Root workspace)

---

## 🧰 Technology Stack Overview

### **Frontend Mobile Client**
- **Framework**: React Native CLI `0.74.3` (Pure TypeScript `5.0`)
- **Navigation**: React Navigation `v6` (Native Stack & Bottom Tabs)
- **Icons**: Hugeicons Pro Vector Collection (`@hugeicons/react-native` & `@hugeicons/core-free-icons`)
- **Typography**: Futura PT Custom OTF Family (`Bold`, `Demi`, `Medium`, `Book`, `Regular`, `Light`, `Heavy`)
- **HTTP Client**: Axios `1.7.2` with request JWT interceptors and auto-401 session recovery
- **Storage**: `@react-native-async-storage/async-storage` for local token, theme, and default preference caching
- **Pickers**: `@react-native-community/datetimepicker` for date & time selection

### **Backend Server API**
- **Runtime**: Node.js `v18+` / Express.js framework
- **Database**: MongoDB Atlas / Mongoose `8.x` Object Data Modeling (ODM)
- **Security & Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password hashing, CORS middleware
- **Deployment Platform**: Render Cloud (Production HTTPS Endpoint)

### **Native Android Layer**
- **Native Modules**: Java Native Module (`NotificationModule.java`) exposing custom bridge methods to JS.
- **Background Alarms**: Android `AlarmManager` with `PendingIntent` triggers.
- **Broadcast Receivers**: `AlarmReceiver.java` for background system popups and `NotificationActionReceiver.java` for notification button clicks.

---

## 🖥️ Backend Architecture & Database Specification

### 1. Database Schemas (MongoDB / Mongoose)

#### **User Schema (`backend/src/models/User.ts`)**
```typescript
interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}
```
- **Password Security**: Uses `bcrypt.hash()` with a salt factor of 10 prior to saving. Exposes an instance method `matchPassword()` to compare plaintext inputs against stored hashes.

#### **Task Schema (`backend/src/models/Task.ts`)**
```typescript
interface ITask {
  _id: string;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: 'Work' | 'Personal' | 'Health' | 'Study' | 'Shopping' | 'General';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  dateTime?: Date;    // Scheduled start time
  deadline?: Date;    // Due deadline time
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. JWT Middleware & Authentication Flow (`backend/src/middleware/auth.ts`)
- **Token Extraction**: Parses the `Authorization: Bearer <token>` header from incoming HTTP requests.
- **Token Verification**: Verifies signature against process environment `JWT_SECRET`.
- **Session Duration**: Tokens are generated with a **30-day expiration (`30d`)** (`backend/src/utils/generateToken.ts`) so users remain seamlessly authenticated across application restarts.
- **User Attachment**: Attaches the authenticated MongoDB user instance to `req.user` for downstream controllers.

---

## 📡 Complete REST API Endpoint Specification

Base URL: `https://dailyloop-to-do-app.onrender.com/api`

### 🩺 Health Check
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | No | Returns server status (`200 OK`) and ISO timestamp. |

### 🔑 Authentication Routes (`/api/auth`)
| Method | Endpoint | Auth | Description | Payload / Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | No | Creates a new user account and returns JWT session. | Body: `{ name, email, password }`<br>Response: `{ user: { _id, name, email }, token }` |
| `POST` | `/auth/login` | No | Authenticates credentials and returns JWT session. | Body: `{ email, password }`<br>Response: `{ user: { _id, name, email }, token }` |
| `GET` | `/auth/me` | Yes | Fetches currently authenticated user profile. | Response: `{ _id, name, email }` |
| `PUT` | `/auth/update-profile` | Yes | Updates display name or email address. | Body: `{ name, email }`<br>Response: `{ _id, name, email }` |
| `PUT` | `/auth/change-password` | Yes | Validates current password and updates to new password. | Body: `{ currentPassword, newPassword }`<br>Response: `{ message: "Password updated successfully" }` |

### 📝 Task Management Routes (`/api/tasks`)
| Method | Endpoint | Auth | Description | Payload / Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/tasks` | Yes | Fetches all tasks belonging to the logged-in user. | Response: `Task[]` |
| `POST` | `/tasks` | Yes | Creates a new task item. | Body: `{ title, description, category, priority, dateTime, deadline }`<br>Response: `Task` |
| `PUT` | `/tasks/:id` | Yes | Updates an existing task's fields. | Body: Partial `TaskInput`<br>Response: `Task` |
| `PATCH` | `/tasks/:id/complete` | Yes | Toggles the completion status (`completed: true/false`). | Response: `Task` |
| `DELETE` | `/tasks/:id` | Yes | Permanently deletes a task by ID. | Response: `{ message: "Task removed" }` |

---

## 📱 Mobile Frontend Architecture & Navigation

### 1. Navigation Flow (`src/navigation/`)
- **`AppNavigator.tsx`**: Top-level root navigator. Inspects `AuthContext` state:
  - While `isLoading` is true (restoring session from storage on boot) $\rightarrow$ Displays branded [`SplashScreen.tsx`](file:///c:/Users/Harsha%20Gowda/Desktop/TO-DO%20List/TodoApp/src/screens/SplashScreen.tsx).
  - If authenticated (`user && token`) $\rightarrow$ Renders `<MainNavigator />`.
  - If unauthenticated (`!user || !token`) $\rightarrow$ Renders `<AuthNavigator />` (`Splash` ➔ `Onboarding` ➔ `Login` / `Register`).

- **`MainNavigator`**: Encloses main tabs and modal overlays within `<TaskProvider>`:
  - `Main` $\rightarrow$ `MainTabNavigator` (Bottom tabs: **Home**, **Insights**, **Calendar** + Floating `+` Action Button)
  - `AddEditTask` $\rightarrow$ Presentation Modal for task creation and editing
  - `Profile` $\rightarrow$ Account preferences screen
  - `EditProfile` $\rightarrow$ User profile update screen
  - `ChangePassword` $\rightarrow$ Password security update screen

### 2. State Management Architecture (`src/context/`)
- **`AuthContext.tsx`**: Manages user session state, local `AsyncStorage` persistence (`authToken`, `authUser`), sign-in, registration, profile updates, and global `DeviceEventEmitter` listening for `onUnauthorized` events.
- **`TaskContext.tsx`**: Synchronizes local state with backend REST APIs. Manages filters (`all`, `active`, `completed`), category selection, default priority preferences, and initializes `NotificationService` listeners.
- **`ThemeContext.tsx`**: Manages visual mode (`dark` / `light`), injects color tokens, and persists theme selection across reboots.

---

## 🎨 Design System, Color Tokens & Typography

### 1. Theme Color Palettes (`src/theme/colors.ts`)

| Token | Dark Mode (`#0D0D0D`) | Light Mode (`#F7F6F3`) | Usage |
| :--- | :--- | :--- | :--- |
| `background` | `#0D0D0D` (Pitch Dark) | `#F7F6F3` (Warm Ivory) | Main screen container background |
| `surface` | `#181B20` (Dark Slate) | `#FFFFFF` (Pure White) | Card containers & inputs |
| `surfaceSecondary` | `#232931` (Muted Dark) | `#F0F3F6` (Soft Grey) | Secondary badges & progress tracks |
| `border` | `#262C36` (Subtle Dark) | `#E2E8F0` (Light Border) | Card borders & dividers |
| `textPrimary` | `#FFFFFF` | `#1A202C` | Screen headers & main titles |
| `textSecondary` | `#94A3B8` | `#64748B` | Subcaptions, dates, & metadata |
| `accent` | `#38D9A9` (Mint Cyan) | `#38D9A9` (Mint Cyan) | Progress bar fills & active highlights |
| `priorityHigh` | `#FF5C6C` (Coral Red) | `#FF5C6C` (Coral Red) | High priority badges & Delete action |

### 2. Custom Futura PT Typography System
Custom font family mapping loaded natively from `android/app/src/main/assets/fonts/`:
- `fontFamilies.headingBold` $\rightarrow$ `FuturaPT-Bold`
- `fontFamilies.headingMedium` $\rightarrow$ `FuturaPT-Medium`
- `fontFamilies.body` $\rightarrow$ `FuturaPT-Book`
- `fontFamilies.bodyRegular` $\rightarrow$ `FuturaPT-Regular`
- `fontFamilies.light` $\rightarrow$ `FuturaPT-Light`
- `fontFamilies.heavy` $\rightarrow$ `FuturaPT-Heavy`
- `fontFamilies.demi` $\rightarrow$ `FuturaPT-Demi`

*Note: Android synthetic font fallback bugs are completely eliminated by declaring distinct `fontFamily` tokens without passing conflicting `fontWeight` props.*

---

## ⚡ Core UI/UX Capabilities & Gesture Systems

### 1. Vibrant Task Cards & Dulled Completed States
- **Active Incomplete Tasks**: Render with saturated, vibrant category colors matching modern widget design:
  - **Work**: Vibrant Coral Pink (`#FF5C6C`) with deep red vector graphic.
  - **Personal**: Vibrant Mint Cyan (`#38D9A9`) with deep teal vector graphic.
  - **Health**: Vibrant Golden Sunflower Yellow (`#FFD15C`) with deep amber vector graphic.
  - **Study**: Vibrant Electric Blue (`#4A7DFF`) with deep indigo vector graphic.
  - **Shopping**: Vibrant Royal Purple (`#A066FF`) with deep violet vector graphic.
  - **General**: Crisp Off-White Card (`#F5F6F8`) with dark contrast text.
- **Dulled Completed Tasks**: When marked complete, card background switches to a dulled slate surface (`#1E232B` dark / `#EAECEE` light) with `0.7` container opacity, subtle border (`#2D333B`), muted text, strikethrough, and dimmed graphic watermark (`rgba(255, 255, 255, 0.05)`).

### 2. Animated Horizontal Swipe-to-Delete
- **Gesture Handler**: `SwipeableTaskRow.tsx` uses React Native `PanResponder` and `Animated.ValueXY` for smooth touch tracking.
- **Delete Button Opacity Interpolation**:
  ```typescript
  const actionOpacity = pan.x.interpolate({
    inputRange: [-80, -10, 0],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });
  ```
  *Result*: The red delete action container is **100% invisible (`opacity: 0`)** when unswiped, preventing any bleed-through behind cards. It smoothly fades in only during a physical left swipe.

### 3. Dynamic Task Grouping & Filters
- **Group By Category**: Organizes active tasks under category headers (`Work`, `Personal`, `Health`, `Study`, `Shopping`, `General`).
- **Group By Time of Day**: Dynamically categorizes tasks into temporal time blocks based on `dateTime`:
  - `Morning`: 5:00 AM – 11:59 AM
  - `Afternoon`: 12:00 PM – 4:59 PM
  - `Evening`: 5:00 PM – 8:59 PM
  - `Night`: 9:00 PM – 4:59 AM
- **Date Selector Strip**: 7-day horizontal scrollable date strip with relative day indicators (*Today*, *Tomorrow*, *Yesterday*).

### 4. Interactive Analytics & Calendar
- **Insights Screen (`src/screens/InsightsScreen.tsx`)**: Displays weekly completion progress chart, task velocity counters, and 100% real routine consistency completion rates (*Morning Routine*, *Workload Focus*, *Night Routine*).
- **Calendar Screen (`src/screens/CalendarScreen.tsx`)**: 35-cell month grid displaying task activity dots on scheduled dates and an interactive agenda list for any selected date.

---

## 🔔 Native Android AlarmManager & Notification Engine

### 1. Background Notification Architecture
Native Android files in `android/app/src/main/java/com/todoapp/`:
- **`NotificationModule.java`**: Bridge module exposing `scheduleAlarm()`, `cancelAlarm()`, and `showNotification()` to JavaScript.
- **`AlarmReceiver.java`**: Android `BroadcastReceiver` triggered by `AlarmManager.setExactAndAllowWhileIdle()`. Builds and pops high-priority Android system notifications even when the app is completely closed or killed.
- **`NotificationActionReceiver.java`**: Handles clicks on the in-notification **"Mark as Complete"** action button, updating local state and emitting `onTaskCompletedFromNotification` events back to React Native.

### 2. Smart Notification Message Formatter (`formatTaskReminderMessage`)
Located in `src/services/NotificationService.ts`, dynamically formats task titles into natural English sentences:

```typescript
export const formatTaskReminderMessage = (rawTitle: string): string => {
  // Action Verbs (cook, finish, prepare, go, study, clean, etc.)
  // -> "It's time to cook your dinner"
  // -> "It's time to finish your presentation"
  
  // Noun & Event Titles (haircut, doctor appointment, meeting)
  // -> "It's time for your haircut"
  // -> "It's time for your doctor appointment"
};
```

---

## 🧮 Smart Urgency Sorting Algorithm

DailyLoop uses a multi-factor urgency algorithm (`src/utils/sortTasks.ts`) rather than sorting by a single static field:

$$\text{Urgency Score} = \text{Hours Until Deadline} + \text{Priority Penalty} + \text{Tiebreaker}$$

### Penalty Matrix & Rules:
- **Overdue Penalty**: Tasks with deadlines in the past produce negative `Hours Until Deadline`, forcing overdue items to the top of the list.
- **Priority Penalty**:
  - `High Priority`: +0 virtual hours
  - `Medium Priority`: +6 virtual hours
  - `Low Priority`: +14 virtual hours
- **Scheduled Time Tiebreaker**: `dateTime` start time acts as a secondary tiebreaker for tasks with identical urgency scores.
- **Completion Sink**: Completed tasks automatically sink below all active incomplete tasks.

---

## 📂 Repository Directory Structure & File Map

```
TodoApp/
├── DailyLoop-v1.1.0.apk                   # Production Release APK v1.1.0
├── App.tsx                                # Root Application Component & Provider Wrapper
├── index.js                               # React Native Entry Point
├── package.json                           # NPM Package & Build Script Manifest
├── react-native.config.js                 # Font Asset Links Configuration
├── tsconfig.json                          # TypeScript Compiler Settings
│
├── backend/                               # Express.js REST API Backend
│   ├── render.yaml                        # Render Cloud Deployment Manifest
│   ├── package.json                       # Backend Dependencies
│   └── src/
│       ├── config/db.ts                   # MongoDB Mongoose Connection Instance
│       ├── controllers/
│       │   ├── authController.ts          # Sign In, Sign Up, Profile & Password Controllers
│       │   └── taskController.ts          # Task CRUD & Complete Handlers
│       ├── middleware/auth.ts             # JWT Bearer Guard Middleware
│       ├── models/
│       │   ├── User.ts                    # User Schema & Password Hashing Methods
│       │   └── Task.ts                    # Task Schema & Category Definitions
│       ├── routes/
│       │   ├── authRoutes.ts              # Auth Endpoint Routing
│       │   └── taskRoutes.ts              # Task Endpoint Routing
│       ├── utils/generateToken.ts         # JWT Sign Function (30-day expiry)
│       └── server.ts                      # Express App Setup & /api/health Route
│
├── android/                               # Native Android Studio Project
│   ├── app/
│   │   ├── build.gradle                   # Android Application Build Configuration (v1.1.0)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml        # Permissions & Alarm Receiver Declarations
│   │       ├── assets/fonts/              # Futura PT Custom OTF Font Assets
│   │       ├── java/com/todoapp/
│   │       │   ├── AlarmReceiver.java     # Android AlarmManager Broadcast Receiver
│   │       │   ├── MainActivity.kt        # React Native Activity
│   │       │   ├── MainApplication.java   # App Package Registry
│   │       │   ├── NotificationActionReceiver.java # Mark as Complete Notification Click Handler
│   │       │   ├── NotificationModule.java# Native JS Bridge Module
│   │       │   └── NotificationPackage.java# React Package Wrapper
│   │       └── res/
│   │           ├── mipmap-*/              # Minimal Black & White Infinity App Icons
│   │           └── values/strings.xml     # App Display Name ("Daily Loop")
│   └── build.gradle                       # Root Gradle Build Configuration
│
└── src/                                   # Frontend TypeScript Source Code
    ├── api/
    │   ├── client.ts                      # Axios Client instance & Auto-401 Interceptor
    │   ├── authApi.ts                     # Login, Register & Profile API Calls
    │   └── taskApi.ts                     # Task CRUD API Requests
    ├── components/
    │   ├── AppLogo.tsx                    # Reusable Infinity Loop Vector Logo Component
    │   ├── AuthDialogModal.tsx            # Session Expiry & Alert Modals
    │   ├── FilterBar.tsx                  # Task Filter Mode & Sort Switcher Chips
    │   ├── SwipeableTaskRow.tsx           # PanResponder Swipe-to-Delete Task Card Row
    │   ├── TaskItem.tsx                   # Reusable Task Card Item
    │   └── Input.tsx                      # Styled Form Input Component
    ├── context/
    │   ├── AuthContext.tsx                # JWT Session & AsyncStorage Management
    │   └── TaskContext.tsx                # Task CRUD, Filter & Priority State Context
    ├── navigation/
    │   ├── AppNavigator.tsx               # Root Navigation Container & Auth Guard
    │   └── MainTabNavigator.tsx           # Floating Bottom Navigation Bar & FAB Button
    ├── screens/
    │   ├── SplashScreen.tsx               # Boot Launch Screen with DailyLoop Logo
    │   ├── OnboardingScreen.tsx           # Onboarding Welcome Screen
    │   ├── LoginScreen.tsx                # Account Sign-In Form
    │   ├── RegisterScreen.tsx             # Account Registration Form
    │   ├── HomeScreen.tsx                 # Main Task Dashboard & Progress Tracker
    │   ├── InsightsScreen.tsx             # Productivity Analytics & Routine Consistency
    │   ├── CalendarScreen.tsx             # 35-Cell Month Matrix & Agenda View
    │   ├── ProfileScreen.tsx              # Preferences & Single-Tap Settings
    │   ├── EditProfileScreen.tsx          # Profile Edit Screen
    │   ├── ChangePasswordScreen.tsx       # Password Security Update Screen
    │   └── AddEditTaskScreen.tsx          # Task Creation & Editing Modal Form
    ├── services/
    │   └── NotificationService.ts         # Smart Reminder Message Formatter & Alarm Trigger
    ├── theme/
    │   ├── colors.ts                      # Palette Tokens & Futura PT Typography Definitions
    │   └── ThemeContext.tsx               # Dark & Light Theme State Provider
    ├── types/                             # TypeScript Types (Task, User, ThemePalette, Priority)
    └── utils/
        ├── relativeDate.ts                # Relative Date Formatter (*Today*, *Tomorrow*, *Aug 28*)
        └── sortTasks.ts                   # Multi-Factor Urgency Scoring Algorithm
```

---

## 🛠️ Local Installation, Environment Setup & Deployment

### 1. Prerequisites
- Node.js `v18.0.0+`
- JDK `17` or `21`
- Android Studio with Android SDK `34` and Build-Tools `34.0.0`
- MongoDB Instance (Local or MongoDB Atlas Cluster)

### 2. Backend Service Setup
Navigate to the `backend/` directory and configure environment variables:
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dailyloop?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=30d
```

Start the backend development server:
```bash
npm run dev
```
*Health Check Verification*: Open `http://localhost:5000/api/health` in your browser.

### 3. Frontend App Setup
Navigate to the root directory and install dependencies:
```bash
cd TodoApp
npm install
```

Verify TypeScript compilation:
```bash
npm run typecheck
```

### 4. Running on Android Emulator
In Terminal 1 (Start Metro Bundler):
```bash
npx react-native start
```

In Terminal 2 (Forward Ports & Launch App):
```bash
# Reverse ports for Android Emulator communication
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5000 tcp:5000

# Build & install debug APK on connected emulator
npx react-native run-android
```

### 5. Building Production Release APK
To assemble the standalone production APK:
```bash
npm run build:android
```
The compiled APK will be output to:
- Workspace Root: [`DailyLoop-v1.1.0.apk`](file:///c:/Users/Harsha%20Gowda/Desktop/TO-DO%20List/TodoApp/DailyLoop-v1.1.0.apk)
- Gradle Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📄 License & Attribution

**DailyLoop Productivity Suite**  
*Plan less. Do more.*
