# Aetheron-X

Full-stack task management application built with Next.js, TypeScript, Tailwind CSS, and SQLite.

## Features

- 🔐 **Secure Authentication** - bcrypt password hashing with cookie-based sessions
- 📝 **Task Management** - Full CRUD operations with inline editing
- 🗂️ **Filtering & Sorting** - Filter by status, sort by date/title/due date
- 📅 **Due Dates** - Optional due dates for tasks
- 🎨 **Modern UI** - Responsive design with dark mode support
- 🔔 **Toast Notifications** - Real-time feedback for user actions
- ✅ **Delete Confirmations** - Prevent accidental deletions
- 💾 **SQLite + Prisma** - Type-safe database access

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite with Prisma ORM
- **Authentication**: bcrypt + HMAC-SHA256 sessions

## Scripts

- `npm run dev` - start local development server
- `npm run build` - create production build
- `npm run start` - run production server
- `npm run lint` - run ESLint
- `npx prisma studio` - open Prisma Studio database GUI
- `npx prisma migrate dev` - create and apply database migrations

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment**:
   ```bash
   copy .env.example .env.local
   ```
   Edit `.env.local` and set your secrets:
   - `SESSION_SECRET` - Random string for session signing
   - `CONFIGURED_PASSWORD` - Default admin password

3. **Initialize database**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open app**:
   Navigate to `http://localhost:3000`

## Deployment

### Deploy to Vercel

1. **Push to GitHub** (already configured)

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables:
     - `SESSION_SECRET`
     - `CONFIGURED_PASSWORD`

3. **Deploy**: Vercel will automatically build and deploy

### Environment Variables

Required for production:
```
SESSION_SECRET=your-random-secret-key
CONFIGURED_PASSWORD=your-admin-password
DATABASE_URL=file:./prisma/
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/        # Login, logout, register endpoints
│   │   └── tasks/       # Task CRUD API routes
│   ├── dashboard/       # Protected dashboard page
│   ├── login/           # Login page
│   ├── register/        # Registration page
│   └── layout.tsx       # Root layout with ToastProvider
├── components/
│   ├── TasksManager.tsx # Main task management UI
│   └── Toast.tsx        # Toast notification system
└── lib/
    ├── auth.ts          # Session management
    └── db.ts            # Prisma client singleton

prisma/
├── schema.prisma        # Database schema
├── migrations/          # Database migrations
└── aetheron-x.db        # SQLite database file
```

## API Routes

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Clear session
- `POST /api/auth/register` - Create new user account

### Tasks
- `GET /api/tasks` - Get all tasks for authenticated user
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/[id]` - Update task (title, status, dueDate)
- `DELETE /api/tasks/[id]` - Delete task

## Development

### Database Management

View database in GUI:
```bash
npx prisma studio
```

Create new migration:
```bash
npx prisma migrate dev --name migration_name
```

Reset database:
```bash
npx prisma migrate reset
```

### Code Quality

Run linter:
```bash
npm run lint
```

Check types:
```bash
npx tsc --noEmit
```

## License

MIT


- Auth scaffold: `GET /login`, `POST /api/auth/login`, `POST /api/auth/logout`
- Protected page: `GET /dashboard`
- First protected API route: `GET /api/tasks`