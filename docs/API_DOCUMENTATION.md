# YoumeChat API & Real-Time Socket Specification

Base API URL: `/api/v1`

---

## 1. Expanded REST Modules

- `/api/v1/auth`: Google Login, Token Refresh, Session Revocation, Logout Current/All Devices, Device Fingerprinting.
- `/api/v1/users`: Profile, Username Lookup, Search Users.
- `/api/v1/chats`: Fetch Active Chats, Pin, Mute, Archive.
- `/api/v1/messages`: Fetch History, Send Text/Media/Polls/Disappearing, Reactions, Read Receipts.
- `/api/v1/groups`: Create Group, Add/Remove Members, Assign Group Roles (`Owner`, `Admin`, `Member`).
- `/api/v1/media`: Upload Media, Thumbnails, Virus Scan Validation Hook.
- `/api/v1/search`: Atlas Search / Elasticsearch Abstraction Layer.
- `/api/v1/settings`: Update Preferences, Dark Mode, Privacy.
- `/api/v1/admin`: Analytics, User Banning, Content Deletion, Report Audits.
- `/api/v1/calls`: WebRTC Call Signaling Logs.
- `/api/v1/notifications`: User Notifications Queue.

---

## 2. Real-Time Socket.IO Events (23 Events)

| Category | Socket Events |
|----------|---------------|
| **Connection & Presence** | `connect`, `disconnect`, `user_online`, `user_offline`, `presence_update` |
| **Rooms & Messaging** | `join_chat`, `leave_chat`, `send_message`, `receive_message`, `message_updated`, `message_deleted`, `message_reaction`, `message_read`, `message_delivered` |
| **Group Operations** | `join_group`, `leave_group` |
| **Typing & Notifications** | `typing`, `stop_typing`, `notification` |
| **WebRTC Calls** | `call_invite`, `call_accept`, `call_reject`, `call_end` |
