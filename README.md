# YoumeChat - Production Real-Time Messaging Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Flutter](https://img.shields.io/badge/Flutter-Latest%20Stable-02569B.svg)](https://flutter.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/cloud/atlas)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101.svg)](https://socket.io/)
[![Material 3](https://img.shields.io/badge/Material-3-757575.svg)](https://m3.material.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-Background%20Workers-red.svg)](https://bullmq.io/)
[![Pino](https://img.shields.io/badge/Pino-Structured%20Logging-brightgreen.svg)](https://getpino.io/)
[![Prometheus](https://img.shields.io/badge/Prometheus-Metrics-orange.svg)](https://prometheus.io/)

YoumeChat is an enterprise-grade, high-concurrency real-time messaging application designed to support high concurrency (hundreds of thousands of active users). Built with Clean Architecture principles, feature-first design, SOLID patterns, and state-of-the-art UX.

---

## 🌟 Expanded Platform Capabilities

### 1. Database Architecture (26 Normalized MongoDB Collections)
`users`, `profiles`, `userSettings`, `userSessions`, `devices`, `blockedUsers`, `friendRequests`, `contacts`, `chats`, `messages`, `messageReactions`, `readReceipts`, `typingStatus`, `presence`, `groups`, `groupMembers`, `notifications`, `media`, `reports`, `calls`, `callLogs`, `refreshTokens`, `auditLogs`, `deletedMessages`, `archivedChats`, `pinnedChats`.

### 2. Feature-Based Modular Backend Layout (`src/modules/`)
Organized by functional domains (`auth`, `users`, `profiles`, `contacts`, `friendRequests`, `blockedUsers`, `chats`, `messages`, `groups`, `media`, `notifications`, `presence`, `typing`, `calls`, `reports`, `admin`, `search`, `settings`, `devices`, `sessions`, `audit`).

### 3. Background Queue Pipeline (BullMQ)
- `media-processing`: Asynchronous image compression, video thumbnail generation, virus scan validation, Cloudinary upload dispatch.
- `push-notifications`: Multi-device FCM dispatch.
- `system-cleanup`: Scheduled cleanup of expired sessions & deleted messages.

### 4. Logging & Monitoring Infrastructure
- **Pino Structured Log Streams**: `auth.log`, `socket.log`, `database.log`, `security.log`, `admin.log`, `error.log`, `api.log`.
- **Prometheus Metrics**: `/metrics` histogram & request metrics.
- **Health Checks**: `/health`, `/health/readiness`, `/health/liveness`.
- **Sentry Integration**: Centralized exception tracking.

### 5. WebRTC Real-Time Signaling (23 Socket Events)
Supports audio and video call signaling (`call_invite`, `call_accept`, `call_reject`, `call_end`) seamlessly integrated into Socket.IO rooms.

---

## 🏗 Project Structure

```
YoumeChat/
├── backend/                  # Node.js + Express + TypeScript + Socket.IO Server
│   ├── src/
│   │   ├── common/           # Pino logger, Prometheus metrics, Sentry, Request ID
│   │   ├── config/           # DB, Redis, Firebase, Cloudinary, Env configs
│   │   ├── constants/        # HTTP status, error codes, socket events, roles
│   │   ├── middlewares/      # Auth, role, error, security, rate limiters
│   │   ├── modules/          # 21 Feature Modules (auth, users, chats, messages, calls, search, etc.)
│   │   ├── queues/           # BullMQ queue configurations
│   │   ├── sockets/          # Socket connection, chat, message & call signaling handlers
│   │   ├── workers/          # BullMQ queue worker processors (media, push, cleanup)
│   │   ├── app.ts            # Express app assembly
│   │   └── server.ts         # HTTP & Socket server bootup
│   ├── tests/                # Jest unit & integration tests
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # Flutter Material 3 Mobile & Web Client
│   ├── lib/
│   │   ├── core/             # Theme, network, error, storage, constants
│   │   ├── features/         # Auth, Profile, Chat, Group, Admin, Settings
│   │   ├── shared/           # Shared widgets, domain models, design system
│   │   ├── routes/           # GoRouter route management with guards
│   │   ├── services/         # SocketService, Dio ApiClient, SecureStorage
│   │   ├── providers/        # Riverpod global state management
│   │   └── main.dart         # Flutter entry point
│   └── pubspec.yaml
│
├── .github/workflows/ci.yml  # GitHub Actions CI Workflow
├── docker-compose.yml        # Docker Multi-Container Configuration
└── docs/                     # Documentation Specifications
```         

---

## 🚀 Quick Start Guide

### 1. Docker Compose (Recommended)
```bash
docker-compose up --build
```

### 2. Manual Development Setup
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
flutter pub get
flutter run
```
