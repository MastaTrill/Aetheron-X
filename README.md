# Aetheron-X

Next.js (TypeScript + Tailwind + App Router) foundation with basic auth and a protected API route.

## Scripts

- `npm run dev` - start local development server
- `npm run build` - create production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Quick Start

1. Install dependencies: `npm install`
2. Copy env file: `copy .env.example .env.local`
3. Start dev server: `npm run dev`
4. Open `http://localhost:3000`

## Included Milestones

- Auth scaffold: `GET /login`, `POST /api/auth/login`, `POST /api/auth/logout`
- Protected page: `GET /dashboard`
- First protected API route: `GET /api/tasks`