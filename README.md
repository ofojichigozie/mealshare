# MealShare

MealShare is a collaborative household app for planning meals, sharing groceries, and splitting household costs. The project combines a React frontend, a NestJS backend, and PostgreSQL storage so roommates and families can coordinate everyday tasks in one place.

## Features
- Household-based meal planning
- Shared shopping lists with purchase tracking
- Cost splitting and balance tracking
- Authentication and profile management
- Real-time notifications for household activity

## Tech Stack
- Frontend: React, Vite, TypeScript, Tailwind CSS, Zustand, Axios, Socket.IO
- Backend: NestJS, TypeScript, PostgreSQL, Drizzle ORM, JWT, Socket.IO

## Clone the repository

```bash
git clone https://github.com/ofojichigozie/mealshare.git
cd mealshare
```

## Prerequisites
- Node.js 18 or newer
- npm
- PostgreSQL running locally

## Backend setup

```bash
cd mealshare-backend
cp .env.example .env
npm install
npm run db:push
npm run start:dev
```

The backend will run at http://localhost:3000.

### Backend environment variables
Create a local environment file in the backend folder with values similar to:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mealshare
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## Frontend setup

```bash
cd ../mealshare-frontend
cp .env.example .env
npm install
npm run dev
```

The frontend will run at http://localhost:5173.

### Frontend environment variables

```env
VITE_API_URL=http://localhost:3000
```

## Project structure
- mealshare-backend: NestJS API and database layer
- mealshare-frontend: React app for the user experience
- _project-docs_: requirements and planning notes

For more details, open the backend and frontend README files in their respective folders.
