# Backend (Fastify + Sequelize + MySQL + Redis + RabbitMQ)

Quick start

1. Copy the environment example and update values:

```bash
cp .env.example .env
# edit .env with your DB/Redis/RabbitMQ/JWT secrets
```

2. Install and run:

```bash
cd backend
npm install
npm run dev
```

Overview

-   Fastify server in `src/index.js` wires Sequelize (`src/models`), Redis (`src/plugins/redis.js`) and RabbitMQ (`src/plugins/rabbitmq.js`).
-   Basic authentication routes in `src/routes/auth.js` implement login + refresh token flows using bcrypt + JWT helpers in `src/auth/jwt.js`.
-   RBAC uses a simple permission matrix at `src/config/permissions.js` and a middleware at `src/middleware/rbac.js`.

Notes

-   This scaffold is minimal and intended as a starting point for a strict-schema, transaction-heavy MySQL backend. Add migrations and stricter validation before production use.
