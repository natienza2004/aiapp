# Simple Inventory System (NestJS + MySQL)

This repository contains a simple inventory management system built with **NestJS** (backend) and a lightweight **HTML/CSS/TypeScript** frontend. It stores data in a **MySQL** database (compatible with WAMP, XAMPP, Docker, etc.).

---

## Features

- Add, view, edit, and delete inventory items
- REST API built with NestJS + TypeORM
- Frontend pages:
  - `index.html` (list view)
  - `add-item.html` (create item)
  - `edit-item.html` (update item)
- Inventory item fields:
  - `id`, `name`, `quantity`, `category`, `description`, `createdAt`

---

## Prerequisites

- Node.js 18+ (or compatible)
- MySQL (WAMP, XAMPP, Docker, etc.)

---

## MySQL Setup (WAMP)

1. Start MySQL (e.g., via WAMP).
2. Open your SQL client (phpMyAdmin, Workbench, CLI) and run:

```sql
CREATE DATABASE IF NOT EXISTS inventory_db;
```

3. Ensure your MySQL user is configured as follows (defaults):

- host: `localhost`
- port: `3306`
- username: `root`
- password: (empty)

If your credentials differ, you can override them via environment variables (see below).

---

## Run the App

### 1) Install dependencies

```bash
npm install
```

### 2) Start the server

```bash
npm run start:dev
```

The server will start on: http://localhost:3000

### 3) Open the frontend

Visit:

- http://localhost:3000/index.html (inventory list)
- http://localhost:3000/add-item.html (add new item)

---

## Configuration

The app reads database settings from environment variables (defaults shown):

- `DB_HOST` (default: `localhost`)
- `DB_PORT` (default: `3306`)
- `DB_USER` (default: `root`)
- `DB_PASS` (default: empty)
- `DB_NAME` (default: `inventory_db`)

Example (Windows PowerShell):

```powershell
$env:DB_NAME = 'inventory_db'
npm run start:dev
```

Or (Linux / macOS):

```bash
DB_NAME=inventory_db npm run start:dev
```

---

## Frontend

Frontend files live in `frontend/` and are served statically by the NestJS backend.

If you want to edit the frontend TypeScript sources, compile them via:

```bash
npx tsc -p frontend/tsconfig.json
```

---

## API Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/items` | List all items |
| GET | `/items/:id` | Get item by ID |
| POST | `/items` | Create a new item |
| PATCH | `/items/:id` | Update item |
| DELETE | `/items/:id` | Delete item |

---

## Testing

This repo includes NestJS testing configuration:

```bash
npm run test
npm run test:e2e
```

---

Happy building!
