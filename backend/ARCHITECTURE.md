# Government Project Management — System Architecture

Overview

-   Stateless Fastify REST APIs behind an API gateway/load balancer.
-   MySQL (primary) with read replicas. Redis for rate-limiting, locks, and caching.
-   RabbitMQ for async jobs (approval requests, escalations, digests) with workers and DLQ.
-   Object storage (S3-compatible) for documents; metadata and hashes in MySQL.
-   Services: auth, projects, tasks, documents, notifications, reporting, workers.

Scaling & Resilience

-   Horizontal scaling: stateless Node.js processes behind LB.
-   Workers scale independently; idempotent jobs with dedupe keys stored in Redis.
-   Database: use connection pooling, read replicas, and partitioning by department if needed.

Security & Compliance

-   JWT auth with short-lived access tokens + refresh token rotation.
-   Row-level access control enforced at query layer (department_id, vendor scoping).
-   Audit logging for every mutating action (who, when, ip, before, after, tx_id).
-   File immutability after approval: store versioned files + SHA256 hashes.

Operational Concerns

-   Monitoring: Prometheus + Grafana, centralized logs (ELK/EFK).
-   Backups: point-in-time recovery for MySQL, object-store lifecycle.
-   Secrets: use vault (env configs reference secret paths).

Key Guarantees

-   All state transitions are event-sourced: each transition stored and logged.
-   Idempotent APIs: clients supply idempotency keys for critical endpoints.
-   Soft deletes: records have `deleted_at` and `deleted_by` and remain auditable.
