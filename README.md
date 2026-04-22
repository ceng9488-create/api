# Registration API

A RESTful API for managing teacher-student registrations, built with NestJS, Prisma, and MySQL.

## Hosted API

- **Base URL**: https://api-production-362a.up.railway.app/api
- **Swagger Docs**: https://api-production-362a.up.railway.app/api#/

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

## Running Locally

1. **Clone the repository**

```bash
git clone https://github.com/ceng9488-create/api.git
cd api
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

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

4. **Run database migrations**

```bash
npx prisma migrate deploy
```

5. **Start the server**

```bash
npm run start:dev
```

The server will start at `http://localhost:29151`.  
Swagger docs available at `http://localhost:29151/api`.

## API Endpoints

All endpoints except `/auth/login` require a Bearer token in the `Authorization` header.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and receive access token |

### Registration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register students under a teacher |
| GET | `/api/commonstudents` | Get students common to given teachers |
| POST | `/api/suspend` | Suspend a student |
| POST | `/api/retrievefornotifications` | Get notification recipients |

## Database Schema

```
Teacher
  id              String   (PK, UUID)
  email           String   (unique)
  createdDateTime DateTime
  updatedDateTime DateTime

Student
  id              String   (PK, UUID)
  email           String   (unique)
  suspended       Boolean  (default: false)
  createdDateTime DateTime
  updatedDateTime DateTime

Registration
  id              String   (PK, UUID)
  teacherId       String   (FK -> Teacher)
  studentId       String   (FK -> Student)
  createdDateTime DateTime

Notification
  id              String   (PK, UUID)
  teacherId       String   (FK -> Teacher)
  message         String
  sentAt          DateTime

NotificationRecipient
  id              String   (PK, UUID)
  notificationId  String   (FK -> Notification)
  studentId       String   (FK -> Student)
```

## Tests

```bash
# unit tests
npm test

# watch mode
npm run test:watch

# coverage report
npm run test:cov
```
