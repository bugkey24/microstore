# MicroStore – Mini E-Commerce with Microservices

MicroStore is a lightweight, distributed e-commerce application designed as a practical project for learning microservices architecture. It features a modern tech stack and follows best practices for service isolation, authentication, and containerization.

## Purpose
This project was developed for a **Distributed Systems course** to demonstrate:
- Microservices decomposition.
- Inter-service communication via REST.
- Secure authentication using JWT and `httpOnly` cookies.
- Container orchestration with Docker Compose for multiple environments.

## System Architecture

MicroStore follows a microservices pattern where each domain (Auth, Product, Order) is managed by an independent service. All services are unified to run on an internal port **3000** within the Docker network.

### Components
- **Frontend (Next.js 16)**: Serves as the UI and the **BFF (Backend for Frontend)**. It handles SSR, client-side reactivity, and orchestrates requests to internal services.
- **Auth Service (Hono + Bun)**: Manages user registration, login, and JWT generation.
- **Product Service (Hono + Bun)**: Manages the product catalog and stock levels.
- **Order Service (Hono + Bun)**: Handles order creation and coordinates with the Product Service to verify stock.
- **Database (PostgreSQL 16)**: A single Postgres instance with logically separated databases for each service.

### Architectural Diagram (Production)
```text
      [ User Browser ]
             |
             | (HTTP @ :3000)
             v
      [ Frontend / BFF ] <-------------------+
      (Container @ :3000)                    |
             |                               |
    +--------+---------+                     |
    |                  |                     |
    v                  v                     |
[ Auth Service ]   [ Order Service ] ----> [ Product Service ]
(Internal :3000)   (Internal :3000) (REST) (Internal :3000)
    |                  |                     |
    +--------+---------+                     |
             |         |                     |
             v         v                     v
      [        PostgreSQL Database Instance        ]
      (Auth DB)      (Order DB)       (Product DB)
```

## Technologies Used
- **Next.js 16 (React 20)**: Modern frontend framework for UI and BFF.
- **Hono**: Ultrafast web framework for the backend services.
- **Bun**: Fast JavaScript runtime and package manager.
- **PostgreSQL 16**: Relational database for data persistence.
- **Docker & Docker Compose**: Containerization and orchestration.
- **JWT (JSON Web Token)**: Secure stateless authentication.
- **Tailwind CSS**: Utility-first CSS framework for styling.

## Repo Structure
```text
microstore/
├── compose.dev.yml       # Dev setup (Hot reload, host-mapped ports)
├── compose.yml           # Production setup (Isolated, unless-stopped)
├── db/                   # Database initialization scripts
├── frontend/             # Next.js application
└── services/             # Backend microservices
    ├── auth/             # User & Auth management (Port :3001 in dev)
    ├── order/            # Order processing       (Port :3003 in dev)
    └── product/          # Catalog & Inventory    (Port :3002 in dev)
```

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Bun](https://bun.sh/) (for local frontend development)

## Installation and Setup

1. **Clone the repository**:
   ```bash
   # Clone repo
   git clone https://github.com/bugkey24/microstore.git

   # Change directory
   cd microstore
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

3. **Development Mode**:
   In this mode, backend services run in containers with hot-reload, while the frontend runs locally on your host.
   ```bash
   # 1. Start backend and database
   docker compose -f compose.dev.yml up -d

   # 2. Start frontend locally
   cd frontend
   bun install
   bun run dev
   ```
   Access the app at: `http://localhost:3000`
   *Backends are exposed at: Auth(:3001), Product(:3002), Order(:3003)*

4. **Production / Demo Mode**:
   In this mode, all services run within the Docker network with high availability.
   ```bash
   docker compose up -d --build
   ```
   Access the app at: `http://localhost:3000`

## 🧪 How to Test (System Validation)

Follow this user journey to verify the full microservices integration:

1.  **Catalog Discovery**: Visit the homepage. Verify that products (Laptop, Smartphone, etc.) are fetched from the **Product Service**.
2.  **User Onboarding**:
    - Navigate to **Register** and create a new account.
    - Navigate to **Login** and sign in.
    - **Verification**: The Navbar should update instantly to show "Orders", "Security", and "Logout" without a page refresh (thanks to global AuthContext).
3.  **Place an Order**:
    - Click on a product to view details.
    - Select a quantity and click **"Buy Now"**.
    - **Verification**: You should be redirected to the **Orders** page, and your new order should appear at the top.
4.  **Inventory Sync**: 
    - Return to the homepage.
    - **Verification**: The **Stock count** for the purchased product should have automatically decreased (Order Service calling Product Service).
5.  **Security Management**:
    - Navigate to the **Security** page.
    - Update your password and verify that the change is persisted by logging out and back in.

## Data Flow for Order Placement

1.  **Frontend/BFF** initiates `POST /orders` to the **Order Service**.
2.  **Order Service** calls **Product Service** (`GET /internal/products/:id`) for each item to verify existence and stock availability.
3.  If stock is sufficient, **Order Service** calls **Product Service** (`PUT /internal/products/:id/stock`) to atomically decrement the inventory.
4.  **Order Service** persists the order details and items in its local database (`order_db`).
5.  **Order Service** returns the finalized order to the **BFF**, which then informs the **Browser**.

## 🛡️ Security Implementation

- **BFF (Backend for Frontend)**: Next.js acts as a secure gateway. The browser never communicates directly with backend services.
- **Stateless Authentication**: Uses **JWT (JSON Web Tokens)** for identity verification.
- **Secure Cookies**: Tokens are stored in **HttpOnly, SameSite=Lax** cookies. This protects the session from XSS (Cross-Site Scripting) attacks as the token cannot be accessed via JavaScript.
- **Network Isolation**: Backend services and databases are not exposed to the public internet. They communicate via a private Docker bridge network.
- **Route Protection**: Server-side middleware and client-side guards prevent unauthorized access to sensitive pages like `/orders` and `/security`.
- **Database Isolation**: Follows the **Database-per-Service** pattern. Each service owns its schema and credentials, preventing a "blast radius" if one database is compromised.

## 📐 Design Choices: Why Microservices?

- **Scalability**: Each service can be scaled independently. If order volume is high, we can scale the Order service without affecting the Catalog.
- **Isolation**: A failure in the Order service doesn't prevent users from browsing the catalog.
- **Technology Diversity**: While we used Hono/Bun for all services here, microservices allow us to swap a service for another language (e.g., Go or Python) if needed for specific tasks.
- **Academic Purpose**: This project explicitly aims to demonstrate distributed system complexities (service discovery, network latency, data consistency).

## Troubleshooting
- **Database Reset**: To start with a fresh database, run:
  ```bash
  docker compose down -v
  ```

## Contributors
- bugkey24
