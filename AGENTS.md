# Agent Knowledge Base

## Project Overview

- **Name:** TechMates Backend
- **Type:** REST API server for the TechMates hackathon landing page
- **Org:** A-TECHMATES

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript 5.5.4 |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Email | Nodemailer (SMTP) |
| CORS | Configured for `http://localhost:3000` (Next.js frontend) |

## Project Structure

```
src/
  index.ts                  # Entry point — Express server on port 5001
  config/
    db.ts                   # Mongoose connection (MongoDB)
  models/
    User.ts                 # User model — email, password, github, discord, role
    Registration.ts         # Registration model — email, github, discord, status
  routes/
    auth.ts                 # POST /api/auth/register, /login, GET /me
    registrations.ts        # POST /, GET / (admin), GET /:id, PATCH /:id, DELETE /:id
    admin.ts                # GET /api/admin/stats
  middleware/
    auth.ts                 # authenticate (JWT verify) + adminOnly (role check)
  utils/
    email.ts                # Nodemailer transporter + sendRegistrationConfirmation()
  types/
    index.ts                # IUser, IRegistration, JwtPayload interfaces
```

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | Public | Create user account, returns JWT |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Bearer token | Get current user profile |
| POST | `/api/registrations` | Public | Submit hackathon registration + sends email |
| GET | `/api/registrations` | Admin | List all registrations (paginated, filterable) |
| GET | `/api/registrations/:id` | Admin | Get single registration |
| PATCH | `/api/registrations/:id` | Admin | Update registration status |
| DELETE | `/api/registrations/:id` | Admin | Delete registration |
| GET | `/api/admin/stats` | Admin | Dashboard stats (counts, spots remaining) |
| GET | `/api/health` | Public | Health check |

## Database Models

### User
- `email` (string, required, unique, lowercase)
- `password` (string, required, min 6, hashed with bcrypt 12 rounds)
- `github` (string, required)
- `discord` (string, required)
- `role` (enum: `user` | `admin`, default: `user`)
- `createdAt`, `updatedAt` (auto via timestamps)

### Registration
- `email` (string, required, lowercase)
- `github` (string, required)
- `discord` (string, required)
- `status` (enum: `pending` | `confirmed` | `cancelled`, default: `pending`)
- `createdAt`, `updatedAt` (auto via timestamps)
- Indexes: `email`, `status`

## Scripts

```bash
npm run dev       # nodemon + ts-node (hot reload)
npm run build     # tsc (compiles to dist/)
npm start         # node dist/index.js (production)
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
PORT=5001                    # Server port
MONGODB_URI=mongodb://localhost:27017/techmates  # MongoDB connection string
JWT_SECRET=your_secret       # JWT signing secret (change in production!)
SMTP_HOST=smtp.gmail.com     # SMTP server
SMTP_PORT=587                # SMTP port
SMTP_USER=you@gmail.com      # SMTP username
SMTP_PASS=app_password       # SMTP password/app password
EMAIL_FROM=TechMates <noreply@techmates.dev>
FRONTEND_URL=http://localhost:3000  # CORS origin
```

## Auth Flow

1. User registers via `POST /api/auth/register` → gets JWT (7 day expiry)
2. User logs in via `POST /api/auth/login` → gets JWT
3. Client sends `Authorization: Bearer <token>` header on protected routes
4. `authenticate` middleware verifies token, attaches `req.user`
5. `adminOnly` middleware checks `req.user.role === 'admin'`

## Email Notifications

- **Registration confirmation** — auto-sent on `POST /api/registrations`
- Styled HTML email matching the dark purple theme (background: `#010102`, primary: `#d3beed`)
- Non-blocking — email failure doesn't break registration flow
- Configure SMTP in `.env` (Gmail, SendGrid, etc.)

## Code Conventions

- **TypeScript strict mode** enabled
- **ES modules:** Uses `import/export` (compiled to CommonJS via tsc)
- **Error handling:** All routes wrapped in try/catch, return `{ error: string }`
- **Response format:** `{ data }` for success, `{ error }` for failures
- **Status codes:** 200 (ok), 201 (created), 400 (bad request), 401 (unauth), 403 (forbidden), 404 (not found), 409 (conflict), 500 (server error)
- **No tests** configured currently

## Frontend Integration

- Frontend repo: `A-TECHMATES/tech-mates-hackthon` (Next.js)
- Frontend calls backend at `NEXT_PUBLIC_API_URL` (default: `http://localhost:5001`)
- `Register.tsx` POSTs to `/api/registrations`
- Total hackathon capacity: **200 spots** (tracked in admin stats)
