# Registration API

A RESTful API for managing teacher-student registrations, built with NestJS, Prisma, and MySQL.

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **ORM**: Prisma
- **Database**: MySQL
- **Validation**: class-validator
- **API Docs**: Swagger (available at `/docs`)

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

Create a `.env` file in the project root:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
PORT=3002
```

3. **Run database migrations**

```bash
npx prisma migrate dev
```

4. **Generate Prisma client**

```bash
npx prisma generate
```

## Running the App

```bash
# development
npm run start

# watch mode (auto-reload)
npm run start:dev

# production
npm run start:prod
```

The server starts on `http://localhost:3002`.  
Swagger docs are available at `http://localhost:3002/docs`.


## Database Schema

```
Teacher
  id              Int      (PK, auto-increment)
  email           String   (unique)
  createdDateTime DateTime (auto: created at)
  updatedDateTime DateTime (auto: updated at)
  students        Student[] (many-to-many)

Student
  id              Int      (PK, auto-increment)
  email           String   (unique)
  suspended       Boolean  (default: false)
  createdDateTime DateTime (auto: created at)
  updatedDateTime DateTime (auto: updated at)
  teachers        Teacher[] (many-to-many)
```

## Tests

```bash
# unit tests
npm run test

# watch mode
npm run test:watch

# coverage report
npm run test:cov
```
