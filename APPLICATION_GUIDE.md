# Wardrobe Manager — Application Guide

## Overview

Wardrobe Manager is a personal wardrobe catalog application. It lets you photograph, categorize, and browse your own clothes in a Myntra-style grid UI—useful for planning outfits, tracking what you own, and filtering by occasion, season, color, and tags.

### Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router 6, Tailwind CSS, Axios, React Icons |
| Backend | Node.js, Express |
| Auth | JWT (7-day tokens), bcrypt password hashing |
| Uploads | Multer (images up to 10 MB) |
| Storage | JSON files on disk (no database required) |
| Optional | Google Sign-In (`@react-oauth/google`), Nodemailer for email reset links |

---

## Features

All of the following are implemented in the current codebase.

### Authentication and account

- **Register** with username, email, password, and optional gender (male / female / unisex).
- **Login** with **username + password** (not email for login).
- **Google Sign-In** (optional; requires `GOOGLE_CLIENT_ID` on server and `REACT_APP_GOOGLE_CLIENT_ID` on client).
- **Forgot password** via OTP (6-digit code, 10-minute expiry) or email reset link (1-hour expiry).
- **Password visibility toggle** on login and other password fields (`PasswordInput` component).
- **Default super admin** created on first server start: username `superadmin`, password `admin123`.

### Wardrobe management

- **Gender-based predefined categories** seeded at registration (or via category initialize endpoint).
- **Category CRUD** with live **dress count** per category.
- **Add dress**: upload a photo from disk **or** capture with device camera, then **crop, rotate, and zoom** in the built-in image editor.
- **Bulk upload**: up to **50 images** under one category in a single request.
- **Edit / delete dresses** (including image replacement and old file cleanup).
- **Filter dresses** by category, color, season, occasion, tags, and free-text search (name/description).
- **Custom user tags** (per-user, merged with admin-defined predefined tags).

### Admin and feedback

- **Comments to admin**: users submit feedback; admins read/mark/delete in an inbox.
- **Super admin panel** (`/admin`):
  - Dashboard stats (users, comments, unread count)
  - User management (list, delete, promote to admin)
  - Predefined data editor (categories by gender, colors, seasons, occasions, tags)
  - Comments inbox
  - Admin users master table (create/delete admin accounts)

### UX and deployment modes

- **Mobile-friendly** responsive layout.
- **Development**: React dev server on port 3000, API on port 5000 (proxy configured in `client/package.json`).
- **Production**: build React app; Express serves `client/build` and API from a **single URL** on port 5000.

---

## User roles

| Role | Access |
|------|--------|
| **Regular user** | Own categories, dresses, tags, comments; dashboard and wardrobe pages. Data is scoped by `userId`. |
| **Admin / superadmin** | Everything a regular user can do (if linked to a user account), plus `/admin` panel. Admin login uses entries in `adminUsers.json`. Roles include `admin` and `superadmin`. |

Admins can exist as standalone accounts (username/password in `adminUsers.json`) or as promoted regular users (`userId` linked in admin record).

---

## Data storage

All persistent data lives under `server/`.

### JSON files (`server/data/`)

| File | Purpose |
|------|---------|
| `users.json` | Registered users (hashed passwords, gender, Google ID, etc.) |
| `categories.json` | User categories (`userId` scoped) |
| `dresses.json` | User dresses (`userId` scoped) |
| `adminUsers.json` | Admin accounts and roles |
| `comments.json` | User-to-admin comments |
| `userTags.json` | Per-user custom tags |
| `passwordResets.json` | Active OTP/email reset tokens |
| `appConfig.json` | Admin-editable predefined categories, colors, seasons, occasions, tags |

Categories and dresses are **always filtered by `userId`** in API handlers—users never see each other's wardrobe data.

### Image uploads

- Path: `server/uploads/{userId}/`
- Served at: `/uploads/{userId}/{filename}`
- Formats: JPEG, PNG, GIF, WebP
- Max size: 10 MB per file; bulk upload max 50 files

---

## API routes summary

Base URL: `http://localhost:5000` (dev) or your deployed host (production).

### Auth — `/api/auth`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/register` | Create user; optional gender seeds categories |
| POST | `/login` | Username + password (checks admin table first) |
| POST | `/google` | Google ID token sign-in |
| POST | `/forgot-password` | Request OTP or email reset (`method`: `otp` \| `email`) |
| POST | `/reset-password-otp` | Reset with username + OTP + new password |
| POST | `/reset-password` | Reset with email token + new password |

### Categories — `/api/categories`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/predefined` | No | Predefined categories by gender |
| POST | `/initialize` | Yes | Seed user categories from gender |
| GET | `/` | Yes | List user categories with dress counts |
| POST | `/` | Yes | Create category |
| PUT | `/:id` | Yes | Update category |
| DELETE | `/:id` | Yes | Delete category |

### Dresses — `/api/dresses`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/predefined/data` | Yes | Colors, tags, seasons, occasions for forms |
| GET | `/` | Yes | List dresses; query: `categoryId`, `color`, `season`, `occasion`, `tag`, `search` |
| GET | `/:id` | Yes | Single dress |
| POST | `/` | Yes | Create dress (multipart `image`) |
| PUT | `/:id` | Yes | Update dress (optional new image) |
| DELETE | `/:id` | Yes | Delete dress and image file |
| POST | `/bulk` | Yes | Bulk upload up to 50 images |

### Tags — `/api/tags`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | Yes | Predefined + custom tags for user |
| POST | `/` | Yes | Create custom tag |
| DELETE | `/:id` | Yes | Delete custom tag |
| GET | `/filter-options` | Yes | Filter dropdown values |

### Comments — `/api/comments`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/` | Yes | Submit comment to admin |
| GET | `/mine` | Yes | User's own comments |

### Admin — `/api/admin` (admin JWT required)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/stats` | Dashboard counts |
| GET | `/users` | All users |
| DELETE | `/users/:id` | Delete user |
| POST | `/users/:id/promote` | Promote user to admin |
| GET | `/admin-users` | List admin accounts |
| POST | `/admin-users` | Create admin account |
| DELETE | `/admin-users/:id` | Remove admin (cannot delete last) |
| GET | `/config` | Get app predefined config |
| PUT | `/config` | Update predefined config |
| GET | `/comments` | All comments (inbox) |
| PUT | `/comments/:id/read` | Mark comment read |
| DELETE | `/comments/:id` | Delete comment |

### Health

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Returns `{ status: 'OK' }` |

---

## Frontend pages and routes

| Route | Page | Access |
|-------|------|--------|
| `/` | Redirects to `/dashboard` | — |
| `/login` | Login (username, Google, forgot password link) | Public |
| `/register` | Registration with gender selection | Public |
| `/forgot-password` | OTP or email reset request | Public |
| `/reset-password` | Set new password (email token from URL) | Public |
| `/dashboard` | Wardrobe overview / stats | Authenticated |
| `/categories` | Category management | Authenticated |
| `/dresses` | Browse, filter, search dresses | Authenticated |
| `/add-dress` | Add dress (upload, camera, editor) | Authenticated |
| `/edit-dress/:id` | Edit existing dress | Authenticated |
| `/bulk-upload` | Bulk image upload | Authenticated |
| `/comments` | Send feedback to admin | Authenticated |
| `/admin` | Super admin panel | Admin only |

Protected routes use JWT stored in `localStorage` (`token`). The axios interceptor sends `Authorization: Bearer <token>` on every request.

---

## Environment variables

Copy `server/.env.example` to `server/.env` and adjust values.

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Production | Secret for signing JWTs (default fallback is insecure) |
| `PORT` | No | Server port (default `5000`) |
| `HOST` | No | Bind address (default `0.0.0.0`) |
| `CLIENT_URL` | For email reset | Frontend base URL for reset links (e.g. `http://localhost:3000` or ngrok URL) |
| `NODE_ENV` | No | Set to `production` for production builds |
| `GOOGLE_CLIENT_ID` | For Google login | Google OAuth client ID (server verifies tokens) |
| `SMTP_HOST` | For email reset | SMTP server host |
| `SMTP_PORT` | No | SMTP port (default `587`) |
| `SMTP_SECURE` | No | `true` for TLS on port 465 |
| `SMTP_USER` | For email reset | SMTP username |
| `SMTP_PASS` | For email reset | SMTP password |
| `SMTP_FROM` | No | From address (defaults to `SMTP_USER`) |

Without SMTP, password reset **email** links are printed to the server console (dev mode). OTP codes are also logged to the console in development.

### Client (`client/.env`)

Create this file for optional client-side config (not committed to git):

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_GOOGLE_CLIENT_ID` | For Google button | Same Google client ID as server |
| `REACT_APP_API_URL` | Optional | Override API base URL in dev (e.g. `http://192.168.1.5:5000` for phone on LAN) |

In production build, the client uses same-origin relative URLs—no separate frontend port.

---

## Sharing remotely

### Local vs public URLs

| Mode | App URL | Notes |
|------|---------|-------|
| **Dev (default)** | `http://localhost:3000` | React dev server; API proxied to `:5000` |
| **Dev on LAN** | `http://<your-LAN-IP>:3000` | Phone on same WiFi; API auto-detects hostname |
| **Production (local)** | `http://localhost:5000` | Single server serves UI + API |
| **Production + ngrok** | `https://xxxx.ngrok-free.app` | Public HTTPS tunnel to port 5000 |

### ngrok (quick share with family/friends)

1. Stop dev servers (`stop.bat` or `Get-Process -Name node | Stop-Process`).
2. Build the client: `cd client && npm run build`.
3. Start server only from project root: `npm run server` (or `cd server && node index.js`).
4. Install [ngrok](https://ngrok.com/) if needed.
5. Run: `ngrok http 5000`
6. Share the **https** forwarding URL ngrok prints.
7. Set `CLIENT_URL` in `server/.env` to that ngrok URL if using email password reset.

Camera capture requires a **secure context** (HTTPS)—ngrok provides this; plain `http://` LAN URLs may block camera on some browsers.

### Render deployment (persistent hosting)

Render (or similar PaaS) can host the Node server:

1. Build command: `cd client && npm install && npm run build && cd ../server && npm install`
2. Start command: `cd server && node index.js`
3. Set environment variables in Render dashboard (`JWT_SECRET`, `NODE_ENV=production`, optional SMTP/Google).
4. **Note:** JSON file storage and local uploads are **ephemeral** on free Render tiers—data may reset on redeploy. For production hosting, plan to migrate to persistent disk or a database + cloud storage.

---

## Security notes

1. **Change the default admin password** immediately after first login (`superadmin` / `admin123`).
2. Set a strong, unique **`JWT_SECRET`** in production—never use the default `your-secret-key-change-in-production`.
3. Do not commit `.env` files or expose SMTP/Google credentials.
4. If an **ngrok authtoken** or tunnel URL was shared publicly, revoke/regenerate the token in your ngrok dashboard.
5. OTP and reset links in dev are logged to the server console—disable or protect server logs in shared environments.
6. File uploads are restricted to image types and size limits, but always run behind HTTPS when exposed to the internet.
7. Admin routes require both a valid JWT and `isAdmin: true` in the token payload.

---

## Project layout (reference)

```
Wardrobe/
├── client/                 # React frontend
│   ├── src/pages/          # Route pages
│   ├── src/components/     # Navbar, ImageEditor, PasswordInput, etc.
│   └── build/              # Production build (after npm run build)
├── server/
│   ├── routes/             # Express route modules
│   ├── middleware/         # JWT auth
│   ├── utils/              # dataStore, configManager, email, seed
│   ├── data/               # JSON persistence
│   └── uploads/            # User images
├── start.bat / start.ps1   # One-click dev startup
├── stop.bat / stop.ps1     # Stop all Node processes
└── package.json            # Root scripts (dev, install-all)
```
