<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-6.x-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License" />
</p>

<h1 align="center">💬 KhatiUp — Real-Time Chat Backend</h1>

<p align="center">
  A production-ready, real-time messaging API built with <strong>Node.js</strong>, <strong>Express 5</strong>, <strong>Socket.IO</strong>, <strong>MongoDB</strong>, and <strong>Redis</strong>.<br/>
  Supports direct messaging, group chats, media uploads, offline message sync, and live typing indicators — all secured with JWT authentication.
</p>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [REST API Documentation](#-rest-api-documentation)
- [Socket.IO Real-Time Events](#-socketio-real-time-events)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)

---

## 🎯 Project Overview

**KhatiUp** is a feature-rich, real-time chat backend designed to power modern messaging applications — similar to WhatsApp or Telegram. It combines a RESTful API for user management and group operations with a **Socket.IO** event-driven layer for instant messaging, typing indicators, and offline message synchronization.

This project demonstrates proficiency in:
- Designing **scalable real-time architectures** with WebSocket + REST hybrid patterns
- Implementing **secure authentication flows** (OTP-based registration, JWT access/refresh tokens)
- Building **layered service architectures** (Controller → Service → Model) for maintainable code
- Leveraging **Redis for presence tracking** and low-latency user state management
- Integrating **cloud services** (Cloudinary for media, ZeptoMail for transactional emails)

---

## ✨ Key Features

### 💬 Messaging
- **Direct & Group Messaging** — one-to-one and multi-participant conversations
- **Message Operations** — send, edit, soft-delete, and reply-to messages
- **Rich Media Support** — text, images, video, audio, files, and location message types
- **Paginated Message History** — efficient cursor-based retrieval via Socket.IO
- **Offline → Online Sync** — automatically delivers missed messages when a user reconnects

### 👥 Groups
- **Full Group Lifecycle** — create, update, and delete group chats
- **Role-Based Permissions** — admin-only operations for member management and group edits
- **Real-Time Notifications** — all participants are instantly notified of group changes

### 🔐 Authentication & Security
- **OTP-Based Registration** — cryptographically secure 6-digit OTPs with bcrypt hashing
- **Dual Token System** — short-lived access tokens + long-lived refresh tokens (JWT)
- **Device Binding** — sessions are tied to device IDs for enhanced security
- **Socket Authentication** — JWT-verified handshake for every WebSocket connection
- **Security Headers** — Helmet.js for HTTP header hardening
- **CORS Configuration** — whitelisted origins with credential support

### 👤 User Management
- **Profile CRUD** — create, view, edit, and delete user profiles
- **Soft & Hard Delete** — deactivate (reversible) or permanently delete accounts
- **Profile Photos** — upload with automatic face-crop optimization via Cloudinary
- **Account Reactivation** — restore previously deactivated accounts

### ⚡ Real-Time Features
- **Live Typing Indicators** — per-chat typing notifications for direct and group chats
- **Presence Tracking** — Redis-backed online/offline status with socket mapping
- **Delivery Receipts** — track which users have received each message
- **Instant Notifications** — group events (create, update, delete, member changes) pushed in real time

### 📧 Email Service
- **Transactional Emails** — OTP verification emails via ZeptoMail
- **Handlebars Templates** — beautifully styled, pre-compiled HTML email templates
- **Fire-and-Forget** — email failures never block the registration flow

### 📖 API Documentation
- **Interactive Swagger UI** — auto-served at `/api-docs` with full endpoint documentation
- **Postman Collection** — ready-to-import collection included for rapid testing

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT APPS                                │
│              (Web / Mobile / Postman / Swagger UI)                  │
└────────────┬───────────────────────────────────┬────────────────────┘
             │  HTTP (REST API)                  │  WebSocket (Socket.IO)
             ▼                                   ▼
┌────────────────────────┐         ┌─────────────────────────────────┐
│    Express Router      │         │     Socket.IO Server            │
│  ┌──────────────────┐  │         │  ┌────────────────────────────┐ │
│  │  Auth Middleware  │  │         │  │  Socket Auth Middleware    │ │
│  │  (JWT Verify)     │  │         │  │  (JWT Handshake Verify)   │ │
│  └────────┬─────────┘  │         │  └───────────┬────────────────┘ │
│           ▼             │         │              ▼                  │
│  ┌──────────────────┐  │         │  ┌────────────────────────────┐ │
│  │  Controllers     │  │         │  │  Socket Event Handlers     │ │
│  │  (user, chat)    │──┼────┐    │  │  (send, edit, delete,      │ │
│  └──────────────────┘  │    │    │  │   typing, get-messages)    │ │
└────────────────────────┘    │    │  └───────────┬────────────────┘ │
                              │    └──────────────┼──────────────────┘
                              ▼                   ▼
                    ┌──────────────────────────────────┐
                    │         Service Layer             │
                    │  ┌────────┐ ┌─────────┐ ┌──────┐ │
                    │  │ User   │ │  Chat   │ │ Mail │ │
                    │  │Service │ │ Service │ │Service│ │
                    │  └───┬────┘ └────┬────┘ └──┬───┘ │
                    │      │ ┌─────────┘         │     │
                    │      ▼ ▼                   ▼     │
                    │  ┌─────────┐  ┌──────────────┐   │
                    │  │ Message │  │  Redis User  │   │
                    │  │ Service │  │   Service    │   │
                    │  └────┬────┘  └──────┬───────┘   │
                    └───────┼──────────────┼───────────┘
                            ▼              ▼
              ┌──────────────────┐  ┌──────────────┐
              │    MongoDB       │  │    Redis      │
              │  ┌────────────┐  │  │  (Presence    │
              │  │ Users      │  │  │   Tracking)   │
              │  │ Chats      │  │  └──────────────┘
              │  │ Messages   │  │
              │  │ Groups     │  │    ┌──────────────┐
              │  └────────────┘  │    │  Cloudinary   │
              └──────────────────┘    │  (Media CDN)  │
                                      └──────────────┘
```

### Layered Architecture

| Layer | Responsibility | Files |
|-------|---------------|-------|
| **Routes** | Define HTTP endpoints, apply middleware | `user.routes.js`, `chat.routes.js` |
| **Middleware** | Auth, file upload, error handling, socket auth | `auth.middleware.js`, `upload.middleware.js`, `error.middleware.js`, `socketAuth.middleware.js` |
| **Controllers** | Request parsing, validation, response formatting | `user.controller.js`, `chat.controller.js` |
| **Services** | Core business logic, DB interactions | `user.service.js`, `chat.service.js`, `message.service.js`, `mail.service.js`, `redisUser.service.js` |
| **Models** | Mongoose schemas with indexes | `user.model.js`, `chat.model.js`, `message.model.js`, `group.model.js` |
| **Sockets** | Real-time event handlers | `socketsRoutes.js`, `chat.socket.js`, `socket.js` |
| **Config** | External service setup | `mongoDb.js`, `redis.js`, `cloudinary.js`, `logger.js`, `mail.config.js` |

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Runtime** | Node.js 18+ | JavaScript server runtime |
| **Framework** | Express 5 | HTTP server & routing |
| **Real-Time** | Socket.IO 4 | Bi-directional WebSocket communication |
| **Database** | MongoDB + Mongoose 9 | Document storage with schema validation |
| **Cache/Presence** | Redis 6 | Online status & socket-to-user mapping |
| **Authentication** | JWT (jsonwebtoken) | Access & refresh token management |
| **Password/OTP** | bcryptjs | Secure OTP hashing |
| **File Upload** | Multer + Cloudinary | In-memory upload → cloud CDN with image optimization |
| **Email** | ZeptoMail + Handlebars | Transactional emails with HTML templates |
| **Security** | Helmet, CORS, express-rate-limit | HTTP hardening & abuse prevention |
| **Logging** | Pino + pino-pretty | Structured JSON logging (production) / pretty-printed (dev) |
| **API Docs** | Swagger UI + YAML | Interactive API documentation |
| **Dev Tools** | Nodemon | Auto-restart on file changes |

---

## 📁 Folder Structure

```
KhatiUp-Backend/
├── server.js                     # Entry point — boots DB, Redis, HTTP server
├── package.json                  # Dependencies & scripts
├── postman_collection.json       # Importable Postman API collection
├── .env                          # Environment variables (not committed)
├── .gitignore
│
└── src/
    ├── app.js                    # Express app + Socket.IO server setup
    │
    ├── config/                   # External service configurations
    │   ├── mongoDb.js            #   MongoDB connection
    │   ├── redis.js              #   Redis client setup
    │   ├── cloudinary.js         #   Cloudinary upload/delete helpers
    │   ├── logger.js             #   Pino logger (env-aware)
    │   └── mail.config.js        #   ZeptoMail client initialization
    │
    ├── models/                   # Mongoose schemas
    │   ├── user.model.js         #   User schema (auth, profile, OTP)
    │   ├── chat.model.js         #   Chat schema (direct + group, indexed)
    │   ├── message.model.js      #   Message schema (types, delivery, replies)
    │   └── group.model.js        #   Group schema (admins, members)
    │
    ├── routes/                   # Express route definitions
    │   ├── user.routes.js        #   Auth & profile endpoints
    │   └── chat.routes.js        #   Group & chat CRUD endpoints
    │
    ├── controller/               # Request handling layer
    │   ├── user.controller.js    #   User auth & profile controllers
    │   └── chat.controller.js    #   Chat & group controllers
    │
    ├── services/                 # Business logic layer
    │   ├── user.service.js       #   Registration, OTP, login, profile ops
    │   ├── chat.service.js       #   Chat & group CRUD, member management
    │   ├── message.service.js    #   Message CRUD, delivery tracking, pagination
    │   ├── mail.service.js       #   Email sending with Handlebars templates
    │   └── redisUser.service.js  #   Redis-backed online presence tracking
    │
    ├── middleware/               # Express & Socket.IO middleware
    │   ├── auth.middleware.js    #   JWT verification for REST routes
    │   ├── socketAuth.middleware.js  # JWT verification for Socket.IO
    │   ├── upload.middleware.js  #   Multer image upload (memory storage)
    │   └── error.middleware.js   #   Global error handler
    │
    ├── sockets/                  # Real-time event system
    │   ├── socketsRoutes.js      #   Socket connection handler & offline sync
    │   ├── chat.socket.js        #   Chat event handlers (send, edit, delete, typing)
    │   └── socket.js             #   Socket.IO singleton accessor
    │
    ├── templates/                # Email templates
    │   └── welcome.hbs           #   OTP verification email (Handlebars)
    │
    ├── utils/                    # Shared utilities
    │   ├── generateToken.js      #   JWT access/refresh token generation
    │   └── apiError.js           #   Standardized API error factory
    │
    └── docs/                     # API documentation
        └── swagger.yaml          #   OpenAPI 3.0 specification
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Redis** (local instance or [Redis Cloud](https://redis.com/try-free/))
- **Cloudinary** account ([free tier](https://cloudinary.com/users/register_free))
- **ZeptoMail** account (optional — for email OTP delivery)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/KhatiUp-Backend.git
cd KhatiUp-Backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section)

# 4. Start the development server
npm run dev
```

The server will start on the port defined in your `.env` file (default: `3000`).

- **API Base URL:** `http://localhost:3000`
- **Swagger UI:** `http://localhost:3000/api-docs`

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with Nodemon (auto-reload on changes) |
| `npm start` | Start in production mode |

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ─── Server ──────────────────────────────────────────────────
PORT=3000
NODE_ENV="dev"                          # "dev" or "production"

# ─── MongoDB ─────────────────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/khatiup

# ─── JWT Tokens ──────────────────────────────────────────────
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
ACCESS_TOKEN_EXPIRE=1d                  # Access token lifetime
REFRESH_TOKEN_EXPIRE=7d                 # Refresh token lifetime

# ─── Redis ───────────────────────────────────────────────────
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password

# ─── Cloudinary ──────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── ZeptoMail (Optional) ───────────────────────────────────
ZEPTO_MAIL_TOKEN=your_zepto_mail_token
ZEPTO_MAIL_FROM_EMAIL=noreply@yourdomain.com
ZEPTO_MAIL_FROM_NAME=KhatiUp
```

---

## 📡 REST API Documentation

> **Interactive Docs:** Run the server and visit [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs) for the full Swagger UI experience.

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/user/v1/register` | ❌ | Register a new user (sends OTP) |
| `POST` | `/user/v1/verify-otp` | ❌ | Verify OTP → receive JWT tokens |
| `POST` | `/user/v1/login` | ❌ | Login with mobile number + device ID |
| `POST` | `/user/v1/logout` | ✅ | Invalidate session tokens |

### Profile Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/user/v1/get-profile` | ✅ | Get authenticated user's profile |
| `PUT` | `/user/v1/edite-profile` | ✅ | Update profile fields / photo |
| `DELETE` | `/user/v1/delete-profile` | ✅ | Permanently delete account |
| `PATCH` | `/user/v1/temporary-delete-profile` | ✅ | Deactivate account (soft delete) |
| `PATCH` | `/user/v1/reactivate-profile` | ✅ | Reactivate deactivated account |

### Chat & Group Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/chat/v1/chats` | ✅ | List all user's chats (sorted by activity) |
| `GET` | `/chat/v1/chats/:chatId` | ✅ | Get single chat with participants |
| `POST` | `/chat/v1/group` | ✅ | Create a group chat |
| `PUT` | `/chat/v1/group/:chatId` | ✅ | Update group details (admin only) |
| `DELETE` | `/chat/v1/group/:chatId` | ✅ | Delete group (creator only) |
| `POST` | `/chat/v1/group/:chatId/members` | ✅ | Add member to group (admin only) |
| `DELETE` | `/chat/v1/group/:chatId/members` | ✅ | Remove member from group |

### Authentication Header

All protected endpoints require a Bearer token:

```
Authorization: Bearer <access_token>
```

---

## ⚡ Socket.IO Real-Time Events

### Connection

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: { token: "<your_access_token>" }
});
```

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `send-message` | `{ chatId?, receiverId?, content, messageType?, attachmentUrl?, replyTo? }` | Send a message. Use `receiverId` for new direct chats (auto-created) or `chatId` for existing conversations. |
| `edit-message` | `{ messageId, chatId, newContent }` | Edit your own message. Ownership is validated via JWT. |
| `delete-message` | `{ messageId, chatId }` | Soft-delete your own message. |
| `get-messages` | `{ chatId, page?, limit? }` | Fetch paginated message history. Returns data via ack callback. |
| `typing` | `{ receiverId?, chatId? }` | Broadcast typing indicator. Use `chatId` for groups, `receiverId` for DMs. |

### Server → Client Events

| Event | Payload | Trigger |
|-------|---------|---------|
| `receive-message` | `{ message, chatId }` | New message in any chat |
| `undelivered-messages` | `{ chatId, messages, count }` | Missed messages synced on reconnect |
| `message-edited` | `{ messageId, chatId, newContent, editedAt }` | A message was edited |
| `message-deleted` | `{ messageId, chatId, deletedAt }` | A message was soft-deleted |
| `user-typing` | `{ senderId, chatId? }` | Someone is typing |
| `group-created` | `{ chat, group }` | Added to a new group |
| `group-updated` | `{ chatId, group, updatedBy }` | Group details changed |
| `group-deleted` | `{ chatId, groupId, deletedBy }` | Group was deleted |
| `member-added` | `{ chatId, userId, addedBy }` | New member joined group |
| `member-removed` | `{ chatId, userId, removedBy }` | Member removed from group |

---

## 🗄 Database Schema

### User

| Field | Type | Description |
|-------|------|-------------|
| `mobile_number` | Number | Unique mobile number (primary identifier) |
| `country_code` | Number | International dialing code |
| `name` | String | Display name |
| `email` | String | Email address (unique, sparse) |
| `profile_photo` | String | Cloudinary URL |
| `deviceId` | String | Bound device identifier |
| `account_status` | Enum | `activated` / `deactivated` |
| `is_verified` | Boolean | OTP verification status |
| `otp` / `otp_expires_at` | String / Date | Hashed OTP with TTL |
| `access_token` / `refresh_token` | String | Active JWT sessions |

### Chat

| Field | Type | Description |
|-------|------|-------------|
| `type` | Enum | `direct` / `group` |
| `groupId` | ObjectId → Group | Reference to Group (for group chats) |
| `participants` | [ObjectId → User] | All users in the chat |
| `lastMessage` / `lastMessageBy` / `lastMessageAt` | Mixed | Last activity metadata |

### Message

| Field | Type | Description |
|-------|------|-------------|
| `chatId` | ObjectId → Chat | Parent conversation |
| `senderId` | ObjectId → User | Message author |
| `content` | String | Text content |
| `messageType` | Enum | `text`, `image`, `video`, `audio`, `file`, `location`, `system` |
| `attachmentUrl` | String | Media file URL |
| `replyTo` | ObjectId → Message | Threaded reply reference |
| `deliveredTo` / `seenBy` | [ObjectId → User] | Delivery & read receipt tracking |
| `isEdited` / `isDeleted` | Boolean | Edit & soft-delete flags |

### Group

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Group display name |
| `profileImage` | String | Group avatar URL |
| `description` | String | Group description |
| `createdBy` | ObjectId → User | Group creator (can delete) |
| `admins` | [ObjectId → User] | Users with admin privileges |
| `members` | [ObjectId → User] | All group members |
| `isActive` | Boolean | Active status (false = deleted) |

---

## 🔒 Security

This project implements multiple layers of security:

- **🔑 JWT Authentication** — stateless access/refresh token pattern with configurable expiry
- **🛡 Helmet.js** — sets secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- **🌐 CORS** — strict origin whitelisting with credentials support
- **🔐 bcrypt OTP Hashing** — OTPs are salted and hashed before storage (never stored in plain text)
- **⏱ OTP Expiry** — 5-minute time-to-live prevents replay attacks
- **📱 Device Binding** — sessions are tied to physical device identifiers
- **🚫 Rate Limiting** — express-rate-limit configured for abuse prevention
- **🔌 Socket Auth** — every WebSocket connection is JWT-verified during handshake
- **📂 Upload Validation** — MIME-type filtering (images only) with 5 MB size limit
- **🧹 Field Whitelisting** — only explicitly allowed fields can be updated via profile edits

---

## 🔮 Future Enhancements

- [ ] **End-to-End Encryption** — client-side encryption using Signal Protocol
- [ ] **Push Notifications** — FCM/APNs integration for mobile clients
- [ ] **Read Receipts UI** — blue-tick style seen-by indicators
- [ ] **Voice & Video Calls** — WebRTC-based calling with Socket.IO signaling
- [ ] **Message Search** — MongoDB Atlas Search / Elasticsearch full-text search
- [ ] **Media Messages** — upload images, videos, and documents within chats
- [ ] **User Blocking** — block/unblock users with message filtering
- [ ] **Message Reactions** — emoji reactions on messages
- [ ] **Refresh Token Rotation** — automatic token rotation for enhanced security
- [ ] **Rate Limiting per Route** — granular rate limiting for sensitive endpoints
- [ ] **Containerization** — Docker + Docker Compose for one-command deployment
- [ ] **CI/CD Pipeline** — GitHub Actions for automated testing and deployment
- [ ] **Unit & Integration Tests** — Jest/Vitest test suite with coverage reporting

---

## 👨‍💻 Author

**Mahesh Das**

Built as a portfolio project to demonstrate full-stack backend engineering with real-time systems, secure authentication patterns, and scalable architecture design.

---

<p align="center">
  <sub>⭐ If you found this project helpful, consider giving it a star!</sub>
</p>
