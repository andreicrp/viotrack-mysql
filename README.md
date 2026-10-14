# 🛡️ VIOTRACK: A Student Violation Tracking and Monitoring System Using QR Code and Dashboard

A modern, responsive **Student Violation Tracking and Monitoring System** built with React 19, Vite 8, a TypeScript/Express REST API, and MySQL through Prisma. Designed for Philippine basic and secondary educational institutions with QR badge scanning, live analytics, audio/haptic feedback, parent summons, geolocation tracking, and SMS alerts.

---

## ✨ Key Features & Capabilities

### 📊 Disciplinary Analytics Dashboard
- Real-time KPI summary cards (Minor, Serious, Major offenses, active sanctions, resolved cases).
- Interactive violation trends area chart with toggleable severity series & date filters (Today / Week / Month / Custom Range).
- Repeat & high-risk students leaderboard with infraction count badges.
- Grade level and strand breakdown with horizontal bar visualizations.
- Integrated school calendar with color-coded event markers and upcoming events panel.
- Executive vector PDF dashboard summary export (`jspdf` + `jspdf-autotable`).

### ⚡ Global Command Palette (`Ctrl + K` / `⌘K`) & Spotlight Navigation
- **Universal Keyboard Command Spotlight**: Instant floating search accessible anywhere in the application via <kbd>Ctrl</kbd> + <kbd>K</kbd> (or <kbd>⌘</kbd> + <kbd>K</kbd> on macOS).
- **Sub-Second Student Dossier Search**: Instant query matching by Student Name, 12-digit LRN, Student ID, or Section with direct dossier routing.
- **Deep System Jump**: Direct navigation across all 11 system modules (Violations Log, QR Scanner, Summons Generator, For Approval, Campus Tracking, etc.).
- **Quick Prefect Actions**: Trigger new violation entries, export accreditation reports, launch the interactive system guide, or lock the session instantly.

### 📷 Live QR Scanner & Tamper-Proof HMAC Badges
- **HMAC-SHA256 Authenticated QR Protocol (`VT2:<student_id>:<timestamp>:<hmac>`)**:
  - Employs cryptographically secure HMAC-SHA256 signature verification to prevent badge forgery.
  - Backward compatible with legacy `VT1` checksum badges.
  - Real-time detection and explicit visual/audio security alerts for forged or altered cryptographic signatures.
  - **Anti-Passback Guard**: Tracks recent scans and alerts prefects if a student ID is re-scanned within 60 seconds.
- **Audio & Haptic Feedback Engine**:
  - 🔔 **Ascending High Chime (`C6 → E6 → B6`)** + Subtle tactile vibration on **Success / Authentic Badge**.
  - ⚠️ **Double Low Buzz (`220Hz / 180Hz`)** + Heavy double vibration on **Invalid / Tampered QR**.
  - Interactive **Feedback Settings Popover** to adjust volume, mute chimes, toggle haptics, and test profiles.
- **Real-Time Camera Scanner (`html5-qrcode`)**: High-framerate optical matrix detection with front/rear camera switcher.
- **Image File Upload Decoder**: Multi-engine canvas preprocessing for low-contrast or rotated photos.
- **1-Click Violation Logging & Student History Modal**: Instant access to infraction logs from scan results.

### 🕒 Institutional 24-Hour Clock & Header Tools
- **Live Tabular Clock (`HH:mm:ss`)**: Synchronized Philippine Standard Time with day/date badges and full locale tooltips.
- **Responsive Header Command Trigger**: OS-aware micro-keycaps (<kbd>Ctrl</kbd> <kbd>K</kbd> / <kbd>⌘</kbd> <kbd>K</kbd>) with smooth elevation and hover states.

### ⚠️ Violation Records & Case Management
- Filterable violation registry (Student name, Student ID, offense category, status, severity, grade, date).
- Dual view modes: **Table View** and **Grid/Card View** with responsive mobile layout.
- **Action Undo Toast Notifications**: 5-second countdown with `↶ Undo` button before permanently committing record updates or deletions.
- Official Parent Summons form generator with scheduled conference details.
- Case resolution modal with clearance notes and celebration confetti.
- CSV and PDF incident report exports with formula injection protection.

### 🎓 Student Directory & ID Card Generation
- Searchable student roster with profile photos, parent/guardian contacts, and emergency info.
- Add, change, and remove profile photos for student, teacher, and administrator records.
- Reuse saved photos in supported views, including adviser cards and the class adviser profile, with initials or generated-avatar fallbacks when no photo is available.
- Printable official Student ID cards with dynamic HMAC-signed QR codes, square-cropped profile photos, and a larger QR code.
- Bulk student roster import via CSV with validation and duplicate prevention.
- Individual student violation detail page with complete infraction history and status tracking.

### 🎨 Responsive Interface & Display
- Circular student photos in the student directory, QR scan identification, and violation views.
- Dark-theme contrast styling for the Guardian SMS notice dialog.
- Staff profile-photo changes sync to the signed-in account avatar in the header and sidebar.

### 📱 Universal "Save As" & Native Mobile File Explorer
- **Desktop / Web**: Automatic background downloads without modal prompts.
- **Android APK / Mobile**: Interactive Microsoft 365 / Google Drive-inspired Save As file explorer with real device filesystem navigation (`@capacitor/filesystem`), direct folder saving, and native print service integration.

### 🔒 Enterprise Security & Access Control
- **Server-managed authentication**: Opaque session IDs stored as hashes in MySQL and delivered in HttpOnly cookies, with CSRF checks and server-side role/section authorization.
- **Offline Mutation Sync Queue**: Transparent offline caching of violation logs during network outages with auto-sync on reconnect.
- **Inactivity Workstation Lock**: Automatic screen lock after idle periods with PIN/password re-authentication.
- **In-App Privacy & Data-Retention Notice**: Full compliance with the Philippine Data Privacy Act of 2012 (RA 10173) and DepEd Child Protection Policy (DO 40, s. 2012).
- **Public Student ID Verification**: Secure `VerifyStudentPage` confirming enrollment status without leaking confidential disciplinary history.
- **Database Backup & Restore**: Admin-only JSON snapshots are exported from MySQL and restored transactionally, including student locations, meetings, SMS logs, and audit events. Backup files are not encrypted and must be stored securely. Password hashes and sessions are never exported; restoring requires the backed-up teacher/admin accounts to still exist in the destination database.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router 7, Recharts |
| **Build Tool** | Vite 8, Route-level code splitting via `React.lazy` |
| **Styling** | Vanilla CSS (Zero Tailwind), Lucide React icons |
| **Backend & Auth** | Node.js 24, Express 5, TypeScript, server-managed HttpOnly sessions, CSRF and RBAC |
| **Database** | MySQL 8.4, Prisma ORM and Prisma Migrate |
| **Audio & Haptics** | Web Audio API Synthesizer + HTML5 Audio + Navigator Vibration API |
| **Mobile** | Capacitor 8 (Android APK with native splash screen, filesystem & share) |
| **Testing & Linting** | Vitest, oxlint, GitHub Actions CI |
| **PDF & CSV** | jsPDF + jsPDF-autotable, CSV security sanitization |
| **QR Engine** | html5-qrcode, HMAC-SHA256 cryptographic signature verification |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 24 LTS
- MySQL 8.4
- npm

### 1. Install dependencies and configure MySQL
```bash
npm install
```

Copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`) and set `DATABASE_URL`, `INITIAL_ADMIN_EMAIL`, a unique `INITIAL_ADMIN_PASSWORD` of 12-72 characters, and a random `QR_HMAC_SECRET` of at least 32 bytes. Replace the temporary `VITE_IT_SUPPORT_EMAIL` with the school's IT Department email before building so the Forgot password dialog contacts the right team. Keep `.env` private. The SMS gateway token is optional and must only be configured on the server.

Create the database once in MySQL before applying migrations:
```sql
CREATE DATABASE viotrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Create the database and seed the initial administrator
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Prisma migrations create the application schema and add later fields such as teacher specialization; the student schema includes track and strand. The seed creates the configured administrator and starter violation categories. QR signatures are issued and verified by the API, not by a key embedded in the frontend. Reprint badges using the new VT3 format; legacy VT1/VT2 signatures are no longer trusted. For an existing installation, back up and map/export the legacy data before migrating. `MYSql_vioTrack.sql` is an archival legacy dump with destructive statements; do not run it against a live database.

For databases created directly from an older MySQL dump and not managed by Prisma Migrate, check the live schema and add only the missing columns before using the updated imports:
```sql
ALTER TABLE `students`
  ADD COLUMN `track` VARCHAR(50) DEFAULT 'JHS',
  ADD COLUMN `strand` VARCHAR(100) DEFAULT 'JHS';

ALTER TABLE `teachers`
  ADD COLUMN `specialization` VARCHAR(150) DEFAULT '';
```
Prisma-managed databases receive the teacher specialization field through the checked-in migration. Do not run the SQL above for columns that already exist.

### 3. Start the API and frontend
Run these in separate terminals and keep both terminals running while using the app:
```bash
npm run server:dev
```
```bash
npm run dev
```
The app is available at `http://localhost:5173`; Vite proxies `/api` requests to the API at `http://localhost:3000`. For Capacitor, configure `VITE_API_BASE_URL` to the deployed HTTPS API origin and allow the app origin in `FRONTEND_ORIGINS` before building.

If port 5173 is already in use, run Vite on another local port, for example `npm run dev -- --host 127.0.0.1 --port 5174 --strictPort`. The API allows localhost and loopback IP origins on alternate ports in development. Production deployments must explicitly list frontend origins in `FRONTEND_ORIGINS`.

Production: run `npm run build` and `npm run build:server`, then start the Node server with `npm run server:start`. It serves the built frontend and API from one origin.

---

## 🧪 Testing & Build

```bash
# Run unit tests (Vitest)
npm test

# Run linter (oxlint)
npm run lint

# Run production build (Vite)
npm run build
```

---

## 📱 Android Build & Distribution

Android APK builds are compiled via Capacitor and distributed through **GitHub Releases**:

```bash
# Sync web assets to Android project
npm run cap:sync

# Build release APK
npm run build:apk

# Build debug APK
npm run build:debug
```

---

## 📁 Project Structure

```
src/
├── assets/             # Audio sound effects & graphic assets
├── components/         # Modular UI components
│   ├── admin/          # PrintDataModal, ExportDataModal, EditAdminModal
│   ├── common/         # SaveAsModal, CustomTimePicker, SectionSelect, PrivacyNoticeModal, SkeletonLoader, ScreenLockModal
│   ├── layout/         # Top navbar, sidebar navigation, responsive wrappers
│   ├── students/       # AddStudentModal, StudentIdModal, BulkImportModal
│   └── violations/     # AddViolationModal, StatusModal, ResolutionModal, ParentSummonsModal
├── context/            # AuthContext (Inactivity Lock), NotificationContext (Undo Toasts)
├── css/                # Responsive stylesheets (dashboard, scan-qr, violations, print)
├── hooks/              # useKeyboardShortcuts
├── lib/                # Credentialed REST API client
├── pages/              # Route-level pages (Dashboard, ScanQR, Violations, Students, Teachers, Advisers, ActivityLogs, VerifyStudentPage)
├── services/           # DataService, SMSService, offlineSyncQueue, caching & backup routines
└── utils/              # qrHelper (HMAC-SHA256), mobilePrintHelper, scannerFeedback, pdfHelper, csvHelper, security
server/                 # Express 5 REST API, session authentication and RBAC
prisma/                 # MySQL schema, migrations and initial seed
```

---

## 📄 License

This project is proprietary software developed for educational institutions. All rights reserved.
