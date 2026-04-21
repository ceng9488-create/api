# Registration API

A RESTful API for managing teacher-student registrations, built with NestJS, Prisma, and MySQL.

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **ORM**: Prisma
- **Database**: MySQL
- **Auth**: JWT (Passport)
- **Validation**: class-validator / class-transformer
- **API Docs**: Swagger

## Prerequisites

- Node.js >= 18
- MySQL database
- npm

## Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-secret-key"
PORT=29151
ADMIN_EMAIL="admin@gmail.com"
ADMIN_PASSWORD="your-password"
```

3. **Run database migrations**

```bash
npx prisma migrate deploy
```

4. **Generate Prisma client**

```bash
npx prisma generate
```

## Running the App

```bash
# development (watch mode)
npm run start:dev

# production
npm run start:prod
```

The server starts on `http://localhost:PORT`.  
Swagger docs: **http://localhost:PORT/api**

## API Endpoints

All endpoints (except login) require a Bearer token in the `Authorization` header.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and get access token |

### Registration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register students under a teacher |
| GET | `/api/commonstudents` | Get students common to given teachers |
| POST | `/api/suspend` | Suspend a student |
| POST | `/api/retrievefornotifications` | Get notification recipients |

