# YoumeChat Installation & Production Deployment Guide

---

## 1. Local Development Setup

### Prerequisites
- Node.js v18.0.0 or higher
- npm or yarn
- Flutter SDK (latest stable)
- MongoDB instance (local or MongoDB Atlas connection string)
- Redis server (optional for single instance, required for clustered scaling)

### Backend Deployment Steps
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env

# Edit .env and supply your MONGODB_URI and Firebase/Cloudinary credentials

# 4. Start local development server with auto-reload
npm run dev

# 5. Build for production
npm run build
npm start
```

### Running Backend Unit & Integration Tests
```bash
cd backend
npm test
```

### Frontend Deployment Steps
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Get Flutter packages
flutter pub get

# 3. Launch application on connected device or browser
flutter run
```

---

## 2. Docker & Containerized Production Deployment

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  app-server:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb+srv://admin:pass@cluster.mongodb.net/youmechat
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_ENABLED=true
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```
