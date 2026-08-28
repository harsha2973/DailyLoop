# DailyLoop Productivity Suite

> **Plan less. Do more.**

**DailyLoop** is a production-grade mobile productivity application built with **React Native CLI (TypeScript)** and a companion **Express.js / MongoDB** backend. Engineered with a minimal, dark visual language, Futura PT typography, Hugeicons stroke vectors, and native Android background alarm scheduling, DailyLoop reduces task management friction through dynamic task grouping, intelligent urgency sorting, real-time analytics, and gesture-driven interactions.

---

## 📱 App Branding & Release APK

- **App Name**: **Daily Loop**
- **App Launcher Icon**: Minimalist Black & White Infinity Symbol ($\infty$)
- **Production Version**: `1.1.0` (Build `2`)
- **Backend API Deployment**: `https://dailyloop-to-do-app.onrender.com/api` (Render)
- **Standalone Release APK**: [`DailyLoop-v1.1.0.apk`](file:///c:/Users/Harsha%20Gowda/Desktop/TO-DO%20List/TodoApp/DailyLoop-v1.1.0.apk)

---

## 📸 Key Features & Architecture Improvements

### 1. Vibrant Task Cards & Dulled Completed States
- **Vibrant Saturated Active Cards**:
  - **Work**: Rich Saturated Coral Pink (`#FF5C6C`) with deep red vector graphic.
  - **Personal**: Rich Saturated Mint Cyan (`#38D9A9`) with deep teal vector graphic.
  - **Health**: Rich Saturated Golden Sunflower Yellow (`#FFD15C`) with deep amber vector graphic.
  - **Study**: Rich Saturated Electric Blue (`#4A7DFF`) with deep indigo vector graphic.
  - **Shopping**: Rich Saturated Royal Purple (`#A066FF`) with deep violet vector graphic.
  - **General**: Crisp Off-White Card (`#F5F6F8`) with dark contrast text.
- **Dulled Completed Cards**: When a task is marked complete, it automatically switches to a dulled surface background (`#1E232B` in dark mode / `#EAECEE` in light mode), low contrast watermark graphic, muted text with strikethrough, and dimmed container opacity.

### 2. Gesture-Driven Swipe-to-Delete
- **Zero UI Clutter**: Task rows have no permanent delete buttons.
- **Animated Swipe Reveal**: Swiping left translates the foreground card. The red delete background uses gesture opacity interpolation (`actionOpacity`) so it remains **100% hidden** when unswiped and smoothly fades in during a swipe.
- **Native Confirmation Dialog**: Pops a safety alert (*"Delete Task: Are you sure you want to delete '[Title]'?"*) before removing a task.

### 3. Native Background Alarms & Smart Notification Messages
- **Android AlarmManager**: Uses native Android `AlarmManager` and `BroadcastReceiver` so scheduled task alarms and 1-minute deadline warnings fire even when the app is completely closed or killed.
- **Smart Adaptive Notification Formatting**:
  - **Action Verbs**: `"cook your dinner"` $\rightarrow$ **`"It's time to cook your dinner"`**, `"finish your presentation"` $\rightarrow$ **`"It's time to finish your presentation"`**
  - **Noun & Event Titles**: `"haircut"` $\rightarrow$ **`"It's time for your haircut"`**, `"doctor appointment"` $\rightarrow$ **`"It's time for your doctor appointment"`**
- **Notification Completion Action**: Notifications feature an in-notification **Mark as Complete** action button that completes the task directly from Android's status bar.

### 4. Typography & Icon System
- **Futura PT Font System**: Entire app uses Futura PT (`FuturaPT-Bold`, `FuturaPT-Medium`, `FuturaPT-Book`, `FuturaPT-Regular`, `FuturaPT-Light`, `FuturaPT-Heavy`, `FuturaPT-Demi`) with clean Android native asset mapping.
- **Hugeicons Vector Icons**: Uses `@hugeicons/react-native` stroke icons across navigation tabs, header actions, task category graphic accents, and modal screens.

### 5. Task Dashboard & Smart Grouping
- **Dynamic Group By Toggle**: Group tasks by:
  - **Category**: `Work`, `Personal`, `Health`, `Study`, `Shopping`, `General`
  - **Time of Day**: `Morning` (5:00 AM – 11:59 AM), `Afternoon` (12:00 PM – 4:59 PM), `Evening` (5:00 PM – 8:59 PM), `Night` (9:00 PM – 4:59 AM)
- **Sentence Case Formatting**: Task titles auto-format to sentence case.
- **Date Selector Strip**: 7-day horizontal date picker with relative date labels (*Today*, *Tomorrow*, *Yesterday*, *Aug 28*).
- **Minimal Progress Card**: Real-time progress tracker with a mint capsule progress bar.

### 6. Session Persistence & Boot Handling
- **Boot Splash Screen**: Shows branded splash logo on app launch while restoring storage.
- **Extended JWT Lifetime**: 30-day token expiration (`30d`).
- **Auto 401 Recovery**: Intercepts `401 Unauthorized` responses, clears invalid local tokens, and safely redirects to Login.

### 7. Interactive Month Calendar & Analytics
- **35-Cell Month Matrix**: Month calendar displaying task activity indicators for scheduled dates.
- **Scheduled Day Agenda**: Inspects tasks for any selected date with scheduled times and priority indicators.
- **Insights & Analytics**: Real weekly completed task summary chart and routine completion rates.

### 8. User Profile & Account Management
- **Edit Profile**: Screen for updating user display name and profile details.
- **Change Password**: Dedicated screen for changing account password securely.
- **Single-Tap Preferences**: Single-tap cycling for default priority and default sorting.

---

## 🧮 Urgency Sorting Algorithm

DailyLoop calculates task urgency dynamically using `src/utils/sortTasks.ts`:

$$\text{Urgency Score} = \text{Hours Until Deadline} + \text{Priority Weight Penalty} + \text{Tiebreaker}$$

- **Hours Until Deadline**: Overdue tasks yield negative values, placing them at the top.
- **Priority Penalty**:
  - `High Priority`: +0 hours
  - `Medium Priority`: +6 hours
  - `Low Priority`: +14 hours
- **Completion Sink**: Completed tasks automatically sink below active tasks.

---

## 🛠️ Repository Structure

```
TodoApp/
├── DailyLoop-v1.1.0.apk         # Standalone Production Release APK
├── App.tsx                      # Root Application Wrapper
├── backend/                     # Express.js / MongoDB Backend Service
│   ├── src/
│   │   ├── config/db.ts         # MongoDB Mongoose Connection
│   │   ├── controllers/         # Auth & Task Controllers
│   │   ├── middleware/auth.ts   # JWT Authentication Guard
│   │   ├── models/              # User & Task Mongoose Schemas
│   │   ├── routes/              # Express API Routes
│   │   ├── utils/generateToken.ts # JWT Token Generator (30d)
│   │   └── server.ts            # Server Entry Point & Health Check
├── android/                     # Native Android Project Files
│   └── app/src/main/
│       ├── assets/fonts/        # Futura PT Custom OTF Font Assets
│       ├── java/com/todoapp/    # Native AlarmManager & Notification Modules
│       └── res/mipmap-*/        # Black & White Infinity App Icons
├── src/
│   ├── api/                     # Axios Client & Interceptors (401 Handler)
│   ├── components/              # SwipeableTaskRow, AppLogo, FilterBar, etc.
│   ├── context/                 # AuthContext & TaskContext
│   ├── navigation/              # AppNavigator & MainTabNavigator
│   ├── screens/                 # HomeScreen, InsightsScreen, CalendarScreen, ProfileScreen, etc.
│   ├── services/                # NotificationService (Smart Reminder Formatting)
│   ├── theme/                   # Colors, Palettes & Futura PT Typography tokens
│   ├── types/                   # TypeScript Type Definitions
│   └── utils/                   # Relative Date Formatter & Urgency Sort
```

---

## 💻 Building & Running Locally

### 1. Backend API
```bash
cd backend
npm run dev
```

### 2. Frontend React Native App
```bash
# Install dependencies
npm install

# Run TypeScript type check
npm run typecheck

# Start Metro Bundler
npx react-native start

# Run on Android Emulator
npx react-native run-android

# Build Production Release APK
npm run build:android
```

---

## 📄 License & Attribution

**DailyLoop Productivity Suite**  
*Plan less. Do more.*
