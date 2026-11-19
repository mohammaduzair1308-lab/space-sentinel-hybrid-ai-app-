# Space Sentinel Firestore Security Specification

## 1. Data Invariants
1. Every document lives under `/users/{userId}/...` where `request.auth.uid == userId` and `request.auth.token.email_verified == true` for writes.
2. Every `ChatMessage` must reference an existing parent `ChatConversation` owned by `request.auth.uid` (verified via `get()`).
3. `ownerId`, `createdAt`, `conversationId`, and conversation `language` are immutable after creation.
4. All `createdAt`, `updatedAt`, and `lastMessageAt` timestamps must equal `request.time`.
5. No shadow/ghost fields are accepted (`hasOnly()` on create and `affectedKeys().hasOnly()` on update).

## 2. Adversarial "Dirty Dozen" Payloads (All Must Fail with PERMISSION_DENIED)
1. Unauthenticated read or list on `/users/uidA/conversations`.
2. Authenticated User B reading or listing User A's `/users/uidA/conversations`.
3. Authenticated User A creating a conversation with `ownerId: "uidB"`.
4. Unverified email user (`email_verified: false`) creating a conversation or message.
5. Creating a conversation with an injected ghost field `{ ..., isAdmin: true }`.
6. Creating a conversation with client-forged timestamp `{ ..., createdAt: "2020-01-01" }`.
7. Updating a conversation to mutate its `language` or `ownerId`.
8. Updating a conversation's `title` without updating `updatedAt == request.time`.
9. Creating a message with `conversationId` mismatching the path parameter.
10. Creating a message under a non-existent parent conversation ID.
11. Attempting to update an existing immutable message in `/messages/{messageId}`.
12. Injecting an oversized (>128 chars) or invalid-character document ID (`../bad`) on `get`/`create`/`delete`.
