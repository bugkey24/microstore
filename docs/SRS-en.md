# Software Requirements Specification (SRS)

## MicroStore – A Microservices-Based Mini E-Commerce Application

**Version:** 1.0
**Date:** 2026-04-26
**Author:** Nexora

---

## Revision History

| 2026-04-26 | 1.0     | Initial SRS document | bugkey24 |
| 2026-04-26 | 1.1     | Unified internal port (3000), added Security page, updated stack (Next.js 16/React 20). | bugkey24 |

---

## Table of Contents

1. [Introduction](#1-introduction)
   1.1 [Purpose](#11-purpose)
   1.2 [Document Conventions](#12-document-conventions)
   1.3 [Intended Audience](#13-intended-audience)
   1.4 [Product Scope](#14-product-scope)
   1.5 [References](#15-references)

2. [Overall Description](#2-overall-description)
   2.1 [Product Perspective](#21-product-perspective)
   2.2 [Product Functions](#22-product-functions)
   2.3 [User Classes and Characteristics](#23-user-classes-and-characteristics)
   2.4 [Operating Environment](#24-operating-environment)
   2.5 [Design and Implementation Constraints](#25-design-and-implementation-constraints)
   2.6 [Assumptions and Dependencies](#26-assumptions-and-dependencies)

3. [System Features](#3-system-features)
   3.1 [Authentication Service](#31-authentication-service-auth-service)
   3.2 [Product Catalog Service](#32-product-catalog-service-product-service)
   3.3 [Order Management Service](#33-order-management-service-order-service)
   3.4 [Inter-Service Communication](#34-inter-service-communication)

4. [External Interface Requirements](#4-external-interface-requirements)
   4.1 [User Interfaces](#41-user-interfaces)
   4.2 [API Interfaces](#42-api-interfaces)
   4.3 [Communication Protocols](#43-communication-protocols)

5. [Non-Functional Requirements](#5-non-functional-requirements)
   5.1 [Performance](#51-performance)
   5.2 [Security](#52-security)
   5.3 [Maintainability](#53-maintainability)
   5.4 [Portability & Containerization](#54-portability--containerization)

6. [Architecture & Technology Stack](#6-architecture--technology-stack)
   6.1 [Technology Stack Details](#61-technology-stack-details)
   6.2 [Architecture Diagram](#62-architecture-diagram)

7. [Repository Structure & GitHub Workflow](#7-repository-structure--github-workflow)
   7.1 [Monorepo Layout](#71-monorepo-layout)
   7.2 [Development Workflow](#72-development-workflow)
   7.3 [CI/CD Pipeline (GitHub Actions)](#73-cicd-pipeline-github-actions)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) describes the functional and non‑functional requirements of **MicroStore**, a lightweight e‑commerce application built with a microservices architecture. MicroStore is developed as an academic project for the _Distributed Systems_ course, focusing on:

- Breaking a monolithic back‑end into independently deployable services.
- Communication between services via RESTful APIs.
- Containerization with Docker.
- Secure, stateless authentication using JWT with httpOnly cookies.

The document is intended to guide development, testing, and deployment, ensuring the project meets all course objectives while following industry best practices.

### 1.2 Document Conventions

- **Keywords**: “MUST”, “SHALL”, “SHOULD” are used as defined in RFC 2119.
- **API endpoints** are written in `UPPERCASE` and `/path`.
- **Database tables** are presented in `snake_case`.
- The application name **MicroStore** refers to the whole system.

### 1.3 Intended Audience

- Developers implementing front‑end and back‑end services.
- Course instructors evaluating the microservices implementation.
- DevOps engineers setting up containerization and CI/CD.

### 1.4 Product Scope

MicroStore provides a minimal, yet complete, e‑commerce experience:

- User registration and login.
- Browsing a catalog of products with stock information.
- Placing orders that automatically reduce product stock.
- Viewing order history.

The system is deliberately kept simple to **demonstrate** microservice principles without the complexity of payment gateways, shopping carts, or e‑mail notifications.

### 1.5 References

- IEEE Std 830‑1998 – _Recommended Practice for Software Requirements Specifications_.
- Docker Documentation – [https://docs.docker.com](https://docs.docker.com)
- Hono Framework – [https://hono.dev](https://hono.dev)
- Next.js Documentation – [https://nextjs.org/docs](https://nextjs.org/docs)

---

## 2. Overall Description

### 2.1 Product Perspective

MicroStore is a greenfield project. It replaces the idea of a monolithic Laravel application with three fine‑grained services and a modern JavaScript/TypeScript front‑end. The backend services run inside Docker containers on a virtualised network, while the front‑end acts as a Backend-For-Frontend (BFF) that secures all communication with the user’s browser.

### 2.2 Product Functions

The product’s high‑level functions are:

- **User Management** – register, login, and obtain a JWT.
- **Product Inquiry** – list all products, view details.
- **Order Placement** – submit an order for one or more products (only if stock is sufficient).
- **Order History** – list past orders for the authenticated user.

All operations after login are protected by a JWT that is never exposed to client‑side JavaScript.

### 2.3 User Classes and Characteristics

- **Customer** – The only end‑user. Can register, browse products, and place orders. Assumed to have basic computer literacy and a modern web browser.
- **Administrator** – Out of scope; product seeding is done via database initialisation scripts, not through a UI.

### 2.4 Operating Environment

The system runs in two main environments:

- **Development** – Developers run each service natively with hot reload (Bun + Next.js) and a local PostgreSQL instance (or Dockerised database). No orchestration required.
- **Production** – All services are containerised with Docker and managed via Docker Compose. The runtime inside each container is Bun, and the base image is `oven/bun:alpine` for minimal size.

### 2.5 Design and Implementation Constraints

- Each microservice MUST own its own database (logical separation; single PostgreSQL instance with three databases is acceptable for this project).
- Inter‑service communication MUST use REST over HTTP (synchronous).
- The front‑end MUST NOT contain any business logic; it functions solely as a BFF.
- Authentication tokens MUST be stored in `HttpOnly; Secure; SameSite=Lax` cookies.
- Technology versions are specified as _latest stable_ at time of development (see §6.1).

### 2.6 Assumptions and Dependencies

- The team has access to a Unix‑like development environment (Linux/macOS).
- Docker Engine 24+ is installed for final containerisation.
- PostgreSQL 16 (latest) is available, either natively or via Docker.
- Internet access is required to pull base images and install npm/bun packages.

---

## 3. System Features

### 3.1 Authentication Service (auth-service)

**Description**
Handles user registration and login, issues JSON Web Tokens (JWT) for authenticated sessions.

**Functional Requirements**

1. `POST /register` – Accepts `{ name, email, password }`, hashes the password, stores user in `auth_db.users`, returns success.
2. `POST /login` – Validates credentials, returns a signed JWT containing `{ userId, email }`.
3. The service MUST sign JWTs with the shared secret `JWT_SECRET`.

**Database Schema** (`auth_db.users`)
| Column | Type | Constraints |
|---------------|--------------|----------------------|
| id | UUID | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| created_at | TIMESTAMP | DEFAULT now() |

**Security**

- Passwords MUST be hashed with bcrypt (or Bun’s built‑in `Bun.password`).
- No plain‑text passwords stored.

### 3.2 Product Catalog Service (product-service)

**Description**
Manages the product catalog. Provides public listing and detail, plus internal endpoints for stock updates.

**Functional Requirements**

1. `GET /products` – Returns all products with basic info (id, name, price, stock).
2. `GET /products/:id` – Returns full product detail.
3. `GET /internal/products/:id` – **Internal only** (no JWT required, protected by Docker network isolation). Used by order-service to fetch price and stock.
4. `PUT /internal/products/:id/stock` – **Internal only**. Body: `{ quantity }` (the amount to reduce). Reduces stock if sufficient, otherwise returns error.

**Database Schema** (`product_db.products`)
| Column | Type | Constraints |
|--------|-----------|-------------------|
| id | UUID | PRIMARY KEY |
| name | VARCHAR | NOT NULL |
| price | DECIMAL | NOT NULL |
| stock | INTEGER | NOT NULL, >= 0 |

**Internal Access Control**

- Internal endpoints SHALL NOT be exposed to the browser. They are reachable only within the Docker bridge network `backend`.
- In development, these endpoints are accessed directly on `localhost` but are not called by the front‑end BFF.

### 3.3 Order Management Service (order-service)

**Description**
Accepts order requests, coordinates with product-service, and maintains order history.

**Functional Requirements**

1. `POST /orders` – Accepts `{ items: [{ productId, quantity }] }` plus JWT (via Authorization header).
   - For each item, the service calls `GET /internal/products/:id` (product-service) to verify price and stock.
   - If all items have enough stock, calls `PUT /internal/products/:id/stock` to decrement.
   - On success, stores the order in `order_db.orders` and `order_db.order_items` with total price and a snapshot of product details.
   - Returns the created order.
   - If any product is out of stock, the whole order is rolled back (no partial stock reduction).
2. `GET /orders` – Returns all orders belonging to the authenticated user (extracted from JWT).

**Database Schema**
`order_db.orders`
| Column | Type | Constraints |
|------------|-----------|------------------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | NOT NULL |
| total | DECIMAL | NOT NULL |
| created_at | TIMESTAMP | DEFAULT now() |

`order_db.order_items`
| Column | Type | Constraints |
|----------------|---------|--------------------------------------|
| id | UUID | PRIMARY KEY |
| order_id | UUID | FOREIGN KEY (orders.id) |
| product_id | UUID | NOT NULL |
| product_name | VARCHAR | NOT NULL (snapshot) |
| price_snapshot | DECIMAL | NOT NULL |
| quantity | INTEGER | NOT NULL |

**Error Handling**

- Service MUST implement an _all‑or‑nothing_ approach for stock deduction, with proper HTTP status codes (409 Conflict on stock failure, 502 if product-service unreachable).

### 3.4 Inter-Service Communication

**Mechanism**
All inter‑service communication is **synchronous REST over HTTP**. The order-service acts as a client to product-service’s internal endpoints. This design demonstrates the challenges of distributed transactions and allows for future discussion of circuit breakers and retries.

**Data Flow for Order Placement**

1.  **Frontend/BFF** initiates `POST /orders` to the **Order Service**.
2.  **Order Service** calls **Product Service** (`GET /internal/products/:id`) for each item to verify existence and stock availability.
3.  If stock is sufficient, **Order Service** calls **Product Service** (`PUT /internal/products/:id/stock`) to atomically decrement the inventory.
4.  **Order Service** persists the order details and items in its local database (`order_db`).
5.  **Order Service** returns the finalized order to the **BFF**, which then informs the **Browser**.

**Resilience (for presentation discussion)**

- Current implementation: simple `fetch` with immediate error propagation.
- A production system would add retry logic, idempotency keys, and possibly a Saga pattern.

---

## 4. External Interface Requirements

### 4.1 User Interfaces

The front‑end is a Next.js 16 web application with six pages:

1. `/login` – Form: email, password. Submits to Next.js API route.
2. `/register` – Form: name, email, password.
3. `/products` – Server‑rendered product list fetched from product-service.
4. `/products/[id]` – Product detail with quantity input and “Buy” button.
5. `/orders` – Displays order history of the logged‑in user.
6. `/security` – Allows users to update their security settings (change password).

The UI is styled with Tailwind CSS for rapid prototyping. No client‑side state management is needed; all data flows through server components and minimal `fetch` calls.

### 4.2 API Interfaces

The BFF layer (Next.js) exposes its own private API routes that correspond to the backend services:

| Next.js API Route         | Backend Target       | Purpose                   |
| ------------------------- | -------------------- | ------------------------- |
| `POST /api/auth/register` | auth-service:3000    | Forward registration data |
| `POST /api/auth/login`    | auth-service:3000    | Forward login, set cookie |
| `GET /api/products`       | product-service:3000 | Relay product list        |
| `GET /api/products/:id`   | product-service:3000 | Relay product detail      |
| `POST /api/orders`        | order-service:3000   | Forward order creation    |
| `GET /api/orders`         | order-service:3000   | Relay order history       |
| `POST /api/auth/change-password` | auth-service:3000 | Forward password change |

All backend responses in JSON are passed through. The BFF only adds the JWT (extracted from cookie) as a `Bearer` token in the `Authorization` header.

### 4.3 Communication Protocols

- **Browser ↔ Next.js** : HTTPS (in production) or HTTP (development). Cookie is sent automatically.
- **Next.js ↔ Backend Services** : HTTP/1.1 over Docker internal network.
- **Backend ↔ PostgreSQL** : TCP connections using `postgres://` connection strings.

---

## 5. Non-Functional Requirements

### 5.1 Performance

- Each service container start‑up time MUST be < 5 seconds.
- API response time for listing products SHALL be < 200ms under normal load.
- The Bun runtime ensures fast cold starts and high throughput.

### 5.2 Security

- JWTs are stored in `HttpOnly; Secure; SameSite=Lax` cookies – not accessible via JavaScript.
- Passwords are hashed using bcrypt or `Bun.password`.
- The shared JWT secret is injected via environment variables, never hard‑coded.
- Backend internal endpoints are not exposed to the host network (only in Docker network).

### 5.3 Maintainability

- Services are written in TypeScript for static type checking.
- Each service has a clear separation of concerns and its own `package.json`.
- Common middleware (CORS, logging) can be extracted into a shared package in the monorepo.
- Configuration is externalised through environment variables.

### 5.4 Portability & Containerization

- All services are containerised using multi‑stage Dockerfiles based on `oven/bun:alpine`.
- The system can be started with a single `docker compose up` command.
- The development workflow supports running services natively (no Docker) for rapid iteration.

---

## 6. Architecture & Technology Stack

### 6.1 Technology Stack Details

_(All versions: “latest” as of project start, e.g., Next.js 16.x, Bun 1.2.x, Hono 4.x, PostgreSQL 16.x)_

```

| Component            | Technology              | Purpose                                                         |
| -------------------- | ----------------------- | --------------------------------------------------------------- |
| **Frontend**         | Next.js 16 (React 20)  | User interface & BFF – handles cookie, proxies to services      |
| **Backend Runtime**  | Bun                     | Runs Hono with near‑zero overhead, supports TypeScript natively |
| **API Framework**    | Hono                    | Ultrafast web framework for each microservice REST endpoint     |
| **Database**         | PostgreSQL              | SQL database, one database per service                          |
| **Authentication**   | jsonwebtoken library    | JWT signing & verification (via `hono/jwt`)                     |
| **Communication**    | REST (fetch)            | Synchronous inter‑service calls                                 |
| **Containerization** | Docker & Docker Compose | Service isolation and reproducible environments                 |
| **Styling**          | Tailwind CSS            | Utility‑first CSS for quick UI development                      |
| **Validation**       | Zod (optional)          | Request body validation inside Hono routes                      |
```

**Shared Secret & Environment Variables**

- `JWT_SECRET` – same value across all services.
- `DATABASE_URL` – per‑service connection string pointing to its own database.
- `AUTH_SERVICE_URL`, `PRODUCT_SERVICE_URL`, `ORDER_SERVICE_URL` – URLs used by the Frontend/BFF to reach internal services.
- `DEV_*_URL` / `PROD_*_URL` – Environment-specific URL templates defined in `.env`.

### 6.2 Architecture Diagram

```
┌─────────────────────────────────────────────┐
│ Browser │
│ (http://localhost:3000) │
└──────────────┬──────────────────────────────┘
│ HttpOnly cookie (JWT)
▼
┌─────────────────────────────────────────────┐
│ Next.js 16 (BFF) │
│ App Router + API Routes │
└───┬──────────┬──────────┬───────────────────┘
│ │ │
▼ ▼ ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Auth │ │ Product│ │ Order │ (Internal Docker network)
│Service │ │Service │ │Service │
│ :3000 │ │ :3000 │ │ :3000 │
└───┬────┘ └───┬────┘ └───┬────┘
│ │ │
▼ ▼ ▼
┌────────┐ ┌────────┐ ┌────────┐
│ auth_db│ │prod_db │ │order_db│ (PostgreSQL – logical databases)
└────────┘ └────────┘ └────────┘
```

---

## 7. Repository Structure & GitHub Workflow

### 7.1 Monorepo Layout

```

microstore/
│
├── .github/
│ └── workflows/
│ └── ci.yml # CI pipeline
├── frontend/ # Next.js app
│ ├── src/
│ │ ├── app/
│ │ │ ├── login/page.tsx
│ │ │ ├── register/page.tsx
│ │ │ ├── products/page.tsx
│ │ │ ├── products/[id]/page.tsx
│ │ │ └── orders/page.tsx
│ │ └── api/ # BFF routes
│ │ ├── auth/
│ │ ├── products/
│ │ └── orders/
│ ├── Dockerfile
│ ├── package.json
│ └── next.config.js
│
├── services/
│ ├── auth/
│ │ ├── src/
│ │ │ └── index.ts # Hono app entry
│ │ ├── package.json
│ │ └── Dockerfile
│ ├── product/
│ │ ├── src/
│ │ │ └── index.ts
│ │ ├── package.json
│ │ └── Dockerfile
│ └── order/
│ ├── src/
│ │ └── index.ts
│ ├── package.json
│ └── Dockerfile
│
├── db/
│ └── init.sql # Creates auth_db, product_db, order_db and tables
│
├── compose.yml # Orchestration for production/demo
├── compose.dev.yml # Orchestration for development
├── .env.example # Template for environment variables
└── README.md

```

### 7.2 Development Workflow

1. **Local Development**
   - Install Bun globally.
   - Start PostgreSQL (either local or `docker compose up postgres -d`).
   - In each service folder: `bun install && bun --hot run src/index.ts`.
   - In `frontend/`: `bun install && bun run dev`.
   - All services talk to `localhost` and see changes instantly.

2. **Containerized Deployment**
   - Development Mode: `docker compose -f compose.dev.yml up -d`. Verify backend at host ports `3001-3003`.
   - Production Mode: `docker compose up -d --build`. Verify application at `http://localhost:3000`.

3. **Database Seeding**
   - The `db/init.sql` script populates the product table with sample data (e.g., 5 products) when the PostgreSQL container is created for the first time.

4. **Direct API Testing**
   - The `api-tests/` folder contains testing files (`api-test.http` and a Postman collection JSON).
   - When running in Development Mode (`compose.dev.yml`), these files can be used to test the APIs directly, bypassing the Next.js BFF.
   - **Exposed Host Ports**: Auth (`3001`), Product (`3002`), Order (`3003`).

### 7.3 CI/CD Pipeline (GitHub Actions)

A simple GitHub Actions workflow (`.github/workflows/ci.yml`) ensures code quality and basic integration:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: admin
          POSTGRES_PASSWORD: secret
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      # Lint & type-check backend services
      - name: Install & check auth-service
        run: cd services/auth && bun install && bun run typecheck
      - name: Install & check product-service
        run: cd services/product && bun install && bun run typecheck
      - name: Install & check order-service
        run: cd services/order && bun install && bun run typecheck

      # Lint & build frontend
      - name: Install & check frontend
        run: cd frontend && bun install && bun run build

      # Optionally run integration tests (e.g., spin up services, hit endpoints)
      - name: Build Docker images
        run: docker compose build
```

**Note:** The `typecheck` script in `package.json` can just be `bun run --bun tsc --noEmit`.

This pipeline validates that all services can be built and that the frontend compiles, ensuring no broken code reaches the main branch.

---

## 8. Glossary

- **BFF** – Backend For Frontend; a server-side component that mediates between the frontend and microservices.
- **JWT** – JSON Web Token; a compact, URL‑safe means of representing claims between parties.
- **httpOnly Cookie** – A browser cookie inaccessible to JavaScript, used here to store the JWT securely.
- **Internal Endpoint** – An API endpoint that is not exposed to the public internet and is used only for inter‑service communication.
- **Monorepo** – A single version‑controlled repository that contains all parts of the system (frontend, multiple backend services, and infrastructure).

---

## 9. Appendices

### Appendix A – Example .env Files

**auth-service/.env**

```
DATABASE_URL=postgresql://admin:secret@localhost:5432/auth_db
JWT_SECRET=super-duper-secret-key
PORT=3000
```

**product-service/.env**

```
DATABASE_URL=postgresql://admin:secret@localhost:5432/product_db
JWT_SECRET=super-duper-secret-key
PORT=3001
```

**order-service/.env**

```

DATABASE_URL=postgresql://admin:secret@localhost:5432/order_db
JWT_SECRET=super-duper-secret-key
PRODUCT_SERVICE_URL=http://localhost:3001
PORT=3002

```

**frontend/.env.local**

```

AUTH_SERVICE_URL=http://localhost:3000
PRODUCT_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3002

```

### Appendix B – Sample Database Initialisation (db/init.sql)

```sql
CREATE DATABASE auth_db;
CREATE DATABASE product_db;
CREATE DATABASE order_db;

\c product_db;

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL CHECK (stock >= 0)
);

INSERT INTO products (name, price, stock) VALUES
('Wireless Mouse', 25.99, 150),
('Mechanical Keyboard', 89.50, 75),
('USB-C Hub', 34.00, 200),
('27" Monitor', 299.99, 30),
('LED Desk Lamp', 19.99, 100);
```

_Tables for `auth_db` and `order_db` are created automatically by the services on startup (or via separate migration scripts)._
