# CivicSense

**CivicSense** is a full-stack civic issue reporting and engagement platform designed to bring transparency, accountability, and community participation into urban governance.  
The platform enables citizens to report local issues, engage through upvotes and discussions, and track resolution status — all through a clean, LinkedIn-inspired interface.

This project focuses on **real-world system design**, **scalable frontend architecture**, and **production-grade authentication flows**, not demo-level prototypes.

---

## Key Objectives

- Provide a unified platform for reporting and tracking civic issues
- Enable community-driven prioritization via upvotes and comments
- Maintain persistent authentication with secure session handling
- Deliver a professional, high-signal UI inspired by modern social platforms
- Design frontend logic that scales without unnecessary re-renders or reloads

---

## Core Features

### Authentication & Session Management
- Secure login & signup using JWT (HTTP-only cookies)
- Persistent sessions across page refresh
- Centralized authentication state using React Context
- Clean logout flow with server + client state invalidation
- Role-based access (Citizen / Admin)

### Issue Lifecycle Management
- Create issues with:
  - Title & description
  - Category & department
  - City → Zone → Locality hierarchy
  - Optional media uploads
- Status tracking:
  - **OPEN**
  - **IN_PROGRESS**
  - **CLOSED**

### Community Interaction
- Toggle upvotes (optimistic UI, no page reloads)
- Inline comment threads per issue
- Prefetched comments for zero-latency expansion
- Real-time count synchronization for upvotes and comments

### Feeds & Discovery
- **Explore Feed**
  - Infinite scrolling using IntersectionObserver
  - Search by issue title or locality
  - Filters out closed issues
- **Left Sidebar**
  - User profile snapshot
  - “My Issues” grouped by status
  - Top issues per status by upvotes
- **Right Sidebar**
  - Trending issues (highest upvotes)
  - Global IN_PROGRESS and CLOSED issues
  - Time- and priority-based sorting

### Profile System
- LinkedIn-style profile layout
- User statistics (posts, upvotes)
- Posts & About tabs
- Editable profile information
- Centralized sign-out via AuthContext

### Admin Capabilities
- Admin dashboard
- Issue moderation and status updates
- Role-aware routing and protection

---

## Tech Stack

### Frontend
- **React** (Vite)
- **React Router**
- **Axios**
- **Context API** (global auth & session state)
- **Custom CSS** (no UI frameworks)
- **Lucide / React Icons**

### Backend
- **Node.js**
- **Express**
- **Prisma ORM**
- **PostgreSQL**
- **JWT Authentication**
- **Cloudinary** for media storage

---

## Architecture Overview

### Authentication Flow
1. User logs in → backend sets secure HTTP-only cookie
2. `/users/me` hydrates frontend auth state
3. AuthContext persists user data in memory + localStorage
4. On refresh, session is revalidated automatically
5. Logout clears:
   - Server cookie
   - AuthContext state
   - Local caches

**Single source of truth:** `AuthContext`

---

### Frontend Design Principles

- No full-page reloads for interactions
- Optimistic UI updates for instant feedback
- Prefetching instead of loading spinners
- Clear separation of concerns:
  - UI ≠ business logic
  - Pages ≠ global state
- Cache where safe, refetch where necessary

---

## Configuration

### Backend API
- **VITE_API_URL**: `https://civic-monitor.onrender.com/`

### Admin Credentials
The following admin accounts are available for testing:

| Email | Password |
|-------|----------|
| urbandevelopment.pattangere@admin.com | Admin@123 |
| trafficpolice.pattangere@admin.com | Admin@123 |
| pwd.pattangere@admin.com | Admin@123 |
| healthdepartment.pattangere@admin.com | Admin@123 |
| bwssb.pattangere@admin.com | Admin@123 |
| bescom.pattangere@admin.com | Admin@123 |
| bbmp.pattangere@admin.com | Admin@123 |

**Common password for all admin accounts**: `Admin@123`

---

## Contributors

- **Amogh A. P.**
- **Shripad G Maradi**
- **Preetham M R**
- **Rohan R Gowda**

