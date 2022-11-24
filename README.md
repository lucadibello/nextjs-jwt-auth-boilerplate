# NextJS JWT authentication boilerplate

## Description

This NextJS 13 boilerplate comes with a fully functional two-factor authentication system based on JWT tokens.

Main features:

- Fully-typed with TypeScript
- Login with email and password (hashed with bcrypt)
- Role-based access control (by default: *User*, *Admin*)
- Automatic JWT access token refresh
- Two-factor authentication via email
- Front-end `useAuth` hook to easily manage the user session
- User session persistence via cookies and local storage
- New flexible back-end middleware management system
- Protected routes and pages

## Tech Stack

- NextJS v13
- TypeScript
- Chakra UI
- React Hook Form
- SWR (stale-while-revalidate)
- Prisma ORM

## Getting Started

### Prerequisites

- Node.js v14.17.0 or higher
- Yarn v1.22.10 or higher
- PostgreSQL v13.3 or higher

### Configuration

#### 1. Install required packages

```sh
yarn install
```

#### 2. (Optional) Create a new PostgreSQL container with Docker
  
```sh
docker run --name nextjs-jwt-auth -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

#### 3. Copy the `.env.example` file to `.env` and fill in the required environment variables

```sh
cp .env.example .env
```

#### 4. Push database schema and seed data to the database
  
```sh
yarn prisma db push && yarn prisma db seed
```

#### 5. Start the development server a

```sh
yarn dev
```
