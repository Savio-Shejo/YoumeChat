<div align="center">

# 💬 YoumeChat — Enterprise Real-Time Messaging Platform

<p align="center">
  <b>A high-concurrency, cross-platform real-time messaging engine built with Clean Architecture, Socket.IO, WebRTC, and Flutter.</b>
</p>

[![Release](https://img.shields.io/badge/Release-v1.0.0-blue.svg?style=for-the-badge&logo=android)](https://github.com/Savio-Shejo/YoumeChat/raw/main/releases/YoumeChat-v1.apk)
[![Live Server Status](https://img.shields.io/badge/Backend-Live%20on%20Render-success.svg?style=for-the-badge&logo=render)](https://youmechat.onrender.com/health)
[![License](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](LICENSE)

<br/>

### 📱 [📥 Download YoumeChat v1.apk — 18.7 MB (Fast Download)](https://github.com/Savio-Shejo/YoumeChat/raw/main/releases/YoumeChat-v1.apk)

---

</div>

## 🌐 Tech Stack & Ecosystem

<table>
  <tr>
    <td align="center" width="25%">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="40" height="40" alt="TypeScript"/>
      <br/><b>TypeScript 5.4</b>
      <br/><sub>Strict Type Engine</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" width="40" height="40" alt="Node.js"/>
      <br/><b>Node.js & Express</b>
      <br/><sub>High-Performance API</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/flutter/flutter-original.svg" width="40" height="40" alt="Flutter"/>
      <br/><b>Flutter 3.x</b>
      <br/><sub>Cross-Platform Client</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg" width="40" height="40" alt="MongoDB"/>
      <br/><b>MongoDB Atlas</b>
      <br/><sub>Cloud Database</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="25%">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/socketio/socketio-original.svg" width="40" height="40" alt="Socket.IO"/>
      <br/><b>Socket.IO 4.7</b>
      <br/><sub>Real-Time WebSockets</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/firebase/firebase-plain.svg" width="40" height="40" alt="Firebase"/>
      <br/><b>Firebase Auth</b>
      <br/><sub>Google OAuth & JWT</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" width="40" height="40" alt="Docker"/>
      <br/><b>Docker & Compose</b>
      <br/><sub>Containerized Engine</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/redis/redis-original.svg" width="40" height="40" alt="Redis"/>
      <br/><b>Redis + BullMQ</b>
      <br/><sub>Async Task Pipelines</sub>
    </td>
  </tr>
</table>

---

## ✨ Key Features & Capabilities

- ⚡ **Instant Real-Time Messaging**: Low-latency bidirectional event communication via Socket.IO.
- 🔐 **Enterprise Authentication**: Google OAuth 2.0 via Firebase & backend custom JWT access/refresh token rotation.
- 📞 **WebRTC Audio & Video Calls**: Peer-to-peer signaling engine supporting `call_invite`, `call_accept`, `call_reject`, and `call_end`.
- 👥 **Group Chats & Member Roles**: Admin moderation, member management, and role-based permissions.
- 🔍 **User Search & Contacts System**: Real-time user lookup, friend requests, contact lists, and blocking.
- ✍️ **Typing Indicators & Read Receipts**: Live typing feedback, online/offline status, and message read confirmations.
- 🛡️ **Admin Moderation Dashboard**: Real-time analytics, user blocking/unblocking, and audit logs.
- 📊 **Monitoring & Observability**: Pino structured log streams (`auth.log`, `socket.log`, `database.log`), Prometheus `/metrics`, and Sentry error tracking.

---

## 📐 System Architecture

```mermaid
graph TD
    A[Flutter Mobile Client] -->|HTTPS REST API| B[Express Gateway]
    A -->|WSS Socket.IO| C[Socket.IO Server Engine]
    A -->|WebRTC P2P| D[Peer Client]
    
    B --> E[MongoDB Atlas Cloud]
    B --> F[Redis Cache & PubSub]
    B --> G[Firebase Auth Service]
    
    C --> F
    C --> E
    
    F --> H[BullMQ Queue Workers]
    H --> I[Cloudinary Media Storage]
```

---

## 📂 Project Repository Structure

```text
YoumeChat/
├── 📄 README.md                  # Project Documentation
├── 📄 docker-compose.yml        # Multi-container local production compose
├── 📁 releases/                 # Standalone release binaries
│   └── 📱 YoumeChat-v1.apk      # Compiled Android Release APK
│
├── 📁 backend/                  # Node.js + Express + TypeScript + Socket.IO Server
│   ├── 📁 src/
│   │   ├── 📁 common/           # Pino logger, Prometheus metrics, Sentry, Request ID
│   │   ├── 📁 config/           # DB, Redis, Firebase, Cloudinary, Env configs
│   │   ├── 📁 constants/        # HTTP status, error codes, socket events, roles
│   │   ├── 📁 middlewares/      # Auth, role, error, security, rate limiters
│   │   ├── 📁 modules/          # 21 Feature Modules (auth, users, chats, messages, calls, search...)
│   │   ├── 📁 queues/           # BullMQ queue configurations
│   │   ├── 📁 sockets/          # Socket connection, chat, message & call signaling handlers
│   │   ├── 📁 workers/          # BullMQ queue worker processors (media, push, cleanup)
│   │   ├── 📄 app.ts            # Express application bootstrap
│   │   └── 📄 server.ts         # Server bootup & lifecycle management
│   ├── 📄 Dockerfile
│   └── 📄 package.json
│
└── 📁 frontend/                 # Flutter Material 3 Mobile & Web Client
    ├── 📁 lib/
    │   ├── 📁 core/             # Theme, network, error, storage, constants
    │   ├── 📁 features/         # Auth, Profile, Chat, Group, Admin, Settings
    │   ├── 📁 shared/           # Shared widgets, domain models, design system
    │   ├── 📁 routes/           # GoRouter route management with guards
    │   ├── 📁 services/         # SocketService, Dio ApiClient, SecureStorage
    │   ├── 📁 providers/        # Riverpod global state management
    │   └── 📄 main.dart         # Flutter application entry point
    └── 📄 pubspec.yaml
```

---

## 🛠️ REST API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Server Health & Uptime Status | ❌ |
| `POST` | `/api/v1/auth/google-login` | Firebase Google Auth Token Verification | ❌ |
| `POST` | `/api/v1/auth/logout` | Revoke Refresh Tokens & End Session | ✅ |
| `GET` | `/api/v1/users/profile` | Get Logged-in User Profile | ✅ |
| `GET` | `/api/v1/search` | Search Users by Username or Email | ✅ |
| `GET` | `/api/v1/chats` | List User Active Conversations | ✅ |
| `POST` | `/api/v1/messages` | Send Message (REST Fallback) | ✅ |
| `GET` | `/api/v1/admin/analytics` | Fetch Moderation Analytics | 🛡️ Admin |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **Flutter SDK**: v3.x or higher
- **Docker & Docker Compose** (Optional)

### Option 1: Quick Run via Docker Compose
```bash
docker-compose up --build
```

### Option 2: Local Development Setup

#### 1. Backend Server Setup
```bash
cd backend
npm install
npm run dev
```

#### 2. Flutter Client Setup
```bash
cd frontend
flutter pub get
flutter run
```

---

<div align="center">

### 👨‍💻 Created & Maintained by Savio Shejo

Distributed under the MIT License. See `LICENSE` for more information.

</div>
