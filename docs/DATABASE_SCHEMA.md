# YoumeChat Expanded 26 Collection Database Schema

Database: **MongoDB Atlas**
ODM: **Mongoose**

---

## Collections Summary (26 Collections)

1. **`users`**: Base credentials, email, username, role, ban flag.
2. **`profiles`**: Public bio, website, location, social links.
3. **`userSettings`**: Dark mode, read receipts, notification sound preferences.
4. **`userSessions`**: Active sessions, IP address, device fingerprint, refresh token hash, revocation flag.
5. **`devices`**: Registered FCM push notification tokens and device IDs.
6. **`blockedUsers`**: User blacklist mappings with blocking reasons.
7. **`friendRequests`**: Connection requests with status (`pending`, `accepted`, `rejected`).
8. **`contacts`**: Saved address book contacts and aliases.
9. **`chats`**: Conversation containers (`private`, `group`).
10. **`messages`**: Text, media, audio, document, location, scheduled, disappearing, and poll messages.
11. **`messageReactions`**: Per-message user emoji reactions.
12. **`readReceipts`**: Delivery & read status timestamps per recipient.
13. **`typingStatus`**: Ephemeral typing indicator states.
14. **`presence`**: Real-time online/offline state and last seen timestamps.
15. **`groups`**: Group metadata, avatar, description, invite codes.
16. **`groupMembers`**: Group membership with roles (`Owner`, `Admin`, `Member`).
17. **`notifications`**: In-app notification queue records.
18. **`media`**: Uploaded media metadata, dimensions, file size, virus scan state.
19. **`reports`**: Moderation tickets for users, groups, or messages.
20. **`calls`**: Active WebRTC call sessions (`ringing`, `connected`, `ended`).
21. **`callLogs`**: Historical call records and call duration.
22. **`refreshTokens`**: Hashed refresh token rotation storage.
23. **`auditLogs`**: Security audit log trail (actor, action, IP).
24. **`deletedMessages`**: Per-user soft delete records.
25. **`archivedChats`**: Per-user archived chat states.
26. **`pinnedChats`**: Per-user pinned chat states.
