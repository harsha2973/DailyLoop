# DailyLoop Productivity Suite

> **Plan less. Do more.**

**DailyLoop** is a production-grade mobile productivity application engineered with **React Native CLI (TypeScript)** and a companion **Express.js / MongoDB** backend. Built around a minimal, dark visual language, DailyLoop reduces task management friction through dynamic task grouping, intelligent urgency sorting, real-time productivity analytics, and intuitive gesture-based interactions.

---

## 📸 Core Capabilities & Features

### 1. Task Dashboard & Smart Grouping
- **Dynamic Group By Toggle**: Switch task grouping seamlessly between:
  - **Category**: `Work`, `Personal`, `Health`, `Study`, `General`
  - **Time of Day**: `Morning` (5:00 AM – 11:59 AM), `Afternoon` (12:00 PM – 4:59 PM), `Evening` (5:00 PM – 8:59 PM), `Night` (9:00 PM – 4:59 AM)
- **Sentence Case Titles**: Displays task titles formatted in clean sentence case (e.g., *Finish project proposal*).
- **Date Selector Strip**: 7-day horizontal date picker with `ALL` view and dynamic relative date labels (*Today*, *Tomorrow*, *Yesterday*, *Aug 28*).
- **Today's Progress Card**: Real-time progress bar computing task completion percentage for the current day.

### 2. Horizontal Swipe-to-Delete
- **Clean Task Cards**: No permanent delete buttons on task rows.
- **Gesture Interaction**: Horizontal left-swipe gesture smoothly translates the task row to reveal a theme-styled Delete action.
- **Confirmation Safety Modal**: Pops a native warning dialog (*Delete Task: Are you sure you want to delete "[Title]"?*) to prevent accidental deletion.

### 3. Real Inputs Insights & Routine Analytics
- **Weekly Summary Chart**: Computes real completed task counts for each day of the current week (Monday through Sunday) and scales bar chart heights dynamically.
- **Routine Consistency Rates**: Calculates 100% real completion rates (`completed / total`) for **Morning Routine**, **Workload Focus**, and **Night Routine**.

### 4. Interactive Month Calendar
- **35-Cell Month Grid**: Full month calendar matrix displaying task activity dots for scheduled dates.
- **Scheduled Day Agenda**: Displays tasks for any selected date with scheduled times and priority indicators.
- **Reliable Date & Time Pickers**: Separate Date and Time selector pills for setting task start times and deadlines.

### 5. Dual Visual Theme Engine
- **Dark Theme** (`#0D0D0D`): Pitch-black background with `#1A1A1A` surface cards, `#282828` subtle borders, and `light-content` status bar.
- **Light Theme** (`#F7F6F3`): Warm off-white background with `#FFFFFF` surface cards, `#E9E9E7` borders, and `dark-content` status bar.
- **Typography System**: Headings and titles styled with `Manrope`; body, metadata, and controls styled with `Inter`.
- **AsyncStorage Persistence**: Theme choice persists across application restarts.

### 6. User Profile & Preferences
- **Single-Tap Inline Settings**: Tap **Default Priority** to cycle `High` ➔ `Medium` ➔ `Low`, or **Default Sorting** to cycle `Smart` ➔ `Time` ➔ `Priority` instantly without popup dialogs.
- **Top-Right Profile Button**: Header avatar button navigating to account management, theme selection, and sign-out confirmation.

---

## 🧮 Smart Urgency Sorting Algorithm

DailyLoop uses a multi-factor urgency algorithm (`src/utils/sortTasks.ts`) rather than sorting by a single static field:

$$\text{Urgency Score} = \text{Hours Until Deadline} + \text{Priority Weight Penalty} + \text{Tiebreaker}$$

- **Hours Until Deadline**: Becomes negative when a task is overdue, placing overdue items at the top.
- **Priority Penalty**: Adds virtual hours to lower-priority tasks:
  - `High Priority`: 0 hours
  - `Medium Priority`: 6 hours
  - `Low Priority`: 14 hours
- **Tiebreaker**: Scheduled `dateTime` start time acts as a minor tiebreaker for tasks with identical urgency.
- **Completion Sink**: Completed tasks automatically sink below active tasks.

---

## 🛠️ Project Architecture

```
TodoApp/
├── App.tsx                      # Root component (SafeArea, ThemeProvider, AuthProvider)
├── src/
│   ├── api/                     # Axios API client & backend endpoints
│   │   ├── client.ts            # Base URL configuration
│   │   ├── authApi.ts           # Login & Registration requests
│   │   └── taskApi.ts           # Task CRUD & completion requests
│   ├── components/              # UI Components
│   │   ├── SwipeableTaskRow.tsx # Horizontal swipe-to-delete row with confirmation
│   │   ├── TaskItem.tsx         # Reusable task item card
│   │   ├── Button.tsx           # Styled action buttons
│   │   └── Input.tsx            # Standard form text input
│   ├── context/
│   │   ├── AuthContext.tsx      # JWT session management & AsyncStorage auth storage
│   │   └── TaskContext.tsx      # Task CRUD, filters, sorting & default preference persistence
│   ├── navigation/
│   │   ├── AppNavigator.tsx     # Main Stack Navigator (Splash, Auth, MainTabs, AddEditTask, Profile)
│   │   └── MainTabNavigator.tsx # Floating 3-Tab bar (Home, Insights, Calendar) + FAB (+ New)
│   ├── screens/
│   │   ├── SplashScreen.tsx     # Splash screen with DailyLoop ∞ logo mark
│   │   ├── LoginScreen.tsx      # Account sign-in
│   │   ├── RegisterScreen.tsx   # New account registration
│   │   ├── HomeScreen.tsx       # Main dashboard with date strip, progress, & task groups
│   │   ├── InsightsScreen.tsx   # Real weekly summary & routine analytics
│   │   ├── CalendarScreen.tsx   # Month matrix & scheduled agenda
│   │   ├── ProfileScreen.tsx    # Preferences & theme switcher
│   │   └── AddEditTaskScreen.tsx# Task creation & editing form
│   ├── theme/
│   │   ├── colors.ts            # Theme palettes (Dark & Light) & Google Fonts typography
│   │   └── ThemeContext.tsx     # Theme Provider & AsyncStorage persistence
│   ├── types/                   # TypeScript interfaces (Task, TaskInput, Priority, ThemePalette)
│   └── utils/                   # Relative date formatting & smart sort urgency algorithm
```

---

## 📱 Environment & Running Instructions

### Backend API Setup
Ensure the DailyLoop backend service is running locally on port 5000:
```bash
cd backend
npm run dev
```

### Mobile App Execution

1. **Install Dependencies**:
   ```bash
   cd TodoApp
   npm install
   ```

2. **Start Metro Bundler**:
   ```bash
   npx react-native start
   ```

3. **Run on Android Emulator**:
   In a second terminal:
   ```bash
   # Enable port forwarding for Metro (8081) & Backend API (5000)
   adb reverse tcp:8081 tcp:8081
   adb reverse tcp:5000 tcp:5000

   # Compile and launch Android app
   npx react-native run-android
   ```

4. **Verify TypeScript Compilation**:
   ```bash
   npm run typecheck
   ```

---

## 📄 License & Attribution

**DailyLoop Productivity Suite**  
*Plan less. Do more.*
