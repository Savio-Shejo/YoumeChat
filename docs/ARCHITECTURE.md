# YoumeChat System Architecture Specification

## 1. Modular Feature Architecture (`src/modules/`)

```
+-------------------------------------------------------------------------------+
|                             Flutter Client                                    |
|                      (Material 3 + Riverpod + Dio)                            |
+--------------------------------───────┬───────────────────────────────────────+
                                        |
                 +──────────────────────┴──────────────────────+
                 |                                             |
            REST API v1                                  Socket.IO / WebRTC
                 |                                             |
                 v                                             v
+----------------────────────────────────────────────────────────---------------+
|                           Express Backend Server                              |
|   (RequestID, Pino Logger, Prometheus, Helmet, CORS, Firebase & Session Auth)  |
+----------------───────────────────────┬───────────────────────────────────────+
                                        |
      +─────────────────+───────────────┼───────────────+─────────────────+
      |                 |               |               |                 |
      v                 v               v               v                 v
+───────────+     +───────────+   +───────────+   +───────────+     +───────────+
| MongoDB   |     | Redis     |   | BullMQ    |   | Cloudinary|     | Sentry    |
| (26 Colls)|     | Pub/Sub   |   | Workers   |   | Storage   |     | Error Trk |
+───────────+     +───────────+   +───────────+   +───────────+     +───────────+
```

## 2. Multi-Stream Pino Logging & Observability

- `logs/auth.log`: Authentication, token rotation, session revocation.
- `logs/socket.log`: Socket connection/disconnect, room events, WebRTC signaling.
- `logs/database.log`: Mongoose query performance and connection events.
- `logs/security.log`: Rate limit triggers, NoSQL injection attempts, unauthorized access attempts.
- `logs/admin.log`: Administrative ban/unban commands, report resolutions.
- `logs/error.log`: System exceptions & crash tracebacks.
- `logs/api.log`: REST API request/response metadata with `X-Request-Id`.

## 3. Background Job Queues (BullMQ)

- **`mediaQueue`**: Handles heavy media tasks asynchronously (compression, video thumbnail generation, virus scan validation hooks).
- **`notificationQueue`**: Dispatches high-volume push notifications via FCM without blocking the main event loop.
- **`cleanupQueue`**: Periodically removes expired user sessions, temporary media, and soft-deleted messages.

## 4. WebRTC Call Signaling Infrastructure

The application uses Socket.IO as the signaling plane for WebRTC voice and video calls:
1. `call_invite`: Caller emits SDP offer to target user room.
2. `call_accept`: Receiver accepts call and emits SDP answer.
3. `call_reject`: Receiver rejects call with reason.
4. `call_end`: Terminates active call session and logs metadata to `callLogs`.
