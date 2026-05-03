# Team Task Manager

Full-stack Team Task Management web app with strict folder split:

- `frontend/` for UI pages and components
- `backend/` for APIs, auth, validation, and database schema
- `app/` only as minimal Next.js entrypoints that route to `frontend/` and `backend/`

## Features

- Signup/Login with JWT cookie auth
- Project creation and membership management
- Task creation, assignment, and status updates
- Role-based access (Admin/Member)
- Dashboard metrics: total tasks, status breakdown, tasks per user, overdue tasks

## Stack

- Next.js 15 + TypeScript
- Prisma + SQLite for local development
- Zod validation
- Railway deployment ready

## Setup

1. Install:

```bash
npm install
```

2. Configure env:

```bash
copy .env.example .env
```

3. Push schema:

```bash
npx prisma db push --schema=backend/prisma/schema.prisma
```

4. Seed demo data:

```bash
npm run seed
```

5. Run:

```bash
npm run dev
```

## Railway

1. Create a Railway project and connect the repository.
2. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_NAME`.
3. Use Railway's persistent storage for the SQLite database, or switch `DATABASE_URL` to a managed SQL database before deploying.
4. Build command: `npm run build`
5. Start command: `npm run start`
6. Run the schema sync after deploy:

```bash
npx prisma db push --schema=backend/prisma/schema.prisma
```
7. Seed demo data after the database is initialized:

```bash
npm run seed
```

