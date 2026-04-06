# Simple Inventory System

A lightweight, full-stack inventory management application built with NestJS, TypeScript, and MySQL. Manage your stock items with a clean, web-based interface.

## Table of Contents

- [Quick Start](#quick-start)
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Setup Instructions](#setup-instructions)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [MySQL/WAMP Setup](#mysqlwamp-setup)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [Notes and Assumptions](#notes-and-assumptions)

---

## Quick Start

```bash
# 1. Install backend dependencies
npm install

# 2. Ensure MySQL is running via WAMP

# 3. Start the backend
npm start

# 4. Open frontend in browser
# Navigate to: http://localhost:3000/frontend/index.html
```

Backend runs on `http://localhost:3000`  
Frontend served from `/frontend` folder

---

## Project Overview

The Simple Inventory System is a beginner-friendly stock management application that demonstrates:

- **Full-stack development** with NestJS and Vanilla TypeScript
- **REST API design** patterns and HTTP operations
- **Real-world CRUD** operations on a MySQL database
- **Frontend-backend integration** using Fetch API
- **TypeScript usage** in both backend and frontend

### What the System Does

Users can:
1. ✅ View all inventory items in a table
2. ✅ Add new items to inventory
3. ✅ Edit existing item details (name, quantity, category, description)
4. ✅ Delete items from inventory
5. ✅ See when each item was created

### Use Cases

- **Personal Inventory**: Track personal belongings or hobby collections
- **Small Business**: Manage stock for a small retail or wholesale operation
- **Warehouse**: Simple stock management for a small warehouse
- **Learning Project**: Understand full-stack JavaScript development

---

## Features

### Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| View All Items | ✅ Complete | Display items in sorted table |
| Add Item | ✅ Complete | Create new inventory items |
| Edit Item | ✅ Complete | Update item quantity and details |
| Delete Item | ✅ Complete | Remove items from inventory |
| View Details | ✅ Complete | See complete item information |
| Input Validation | ✅ Complete | Frontend and backend validation |
| Error Handling | ✅ Complete | User-friendly error messages |
| Responsive UI | ✅ Complete | Works on desktop browsers |

### Coming Soon (Out of Scope)

- Search and filtering
- Pagination for large inventories
- User authentication
- Image attachments
- Bulk operations
- Advanced reporting
- Mobile app

---

## Tech Stack

### Backend
- **Framework**: NestJS (TypeScript-first Node.js framework)
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: TypeORM
- **HTTP Server**: Express (built into NestJS)
- **Port**: 3000

### Frontend
- **Markup**: HTML5
- **Styling**: CSS3
- **Language**: TypeScript
- **HTTP Client**: Fetch API
- **No Framework**: Vanilla JavaScript/TypeScript (no React, Vue, etc.)

### Database
- **Engine**: MySQL (via WAMP)
- **Host**: localhost:3306
- **Username**: root
- **Password**: (empty)
- **Database**: inventory_db

### Build/Runtime
- **Runtime**: Node.js
- **Package Manager**: npm
- **Development**: Localhost only

---

## Project Structure

```
aiapp/                              # Project root
├── README.md                        # This file
├── package.json                     # Node.js dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── nest-cli.json                    # NestJS configuration
├── eslint.config.mjs                # ESLint configuration
│
├── src/                             # Backend source code
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Root module
│   ├── app.controller.ts            # Root controller
│   ├── app.service.ts               # Root service
│   │
│   └── items/                       # Items CRUD module
│       ├── items.module.ts          # Module definition
│       ├── items.controller.ts      # API endpoints
│       ├── items.service.ts         # Business logic
│       ├── item.entity.ts           # Database entity
│       └── dto/                     # Data Transfer Objects
│           ├── create-item.dto.ts   # POST /items schema
│           └── update-item.dto.ts   # PATCH /items/:id schema
│
├── frontend/                        # Frontend source code (served as static files)
│   ├── index.html                   # Inventory list page
│   ├── add-item.html                # Add new item page
│   ├── edit-item.html               # Edit item page
│   ├── css/
│   │   └── styles.css               # Global styles
│   └── js/
│       ├── api.ts                   # API client (fetch wrappers)
│       └── inventory.ts             # Business logic and DOM manipulation
│
├── test/                            # E2E tests (if added)
│   └── app.e2e-spec.ts
│
├── uploads/                         # Uploaded files (if file upload added)
│
└── dist/                            # Compiled output (generated)
    └── src/                         # Compiled backend code
```

---

## Installation

### Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **WAMP Stack** - [Download](https://www.wampserver.com/) or use your favorite Apache + MySQL combo
- **MySQL** (included in WAMP)
- **Git** (optional, for cloning repository)

### Step 1: Clone or Download Project

```bash
# Using git
git clone <repository-url>
cd aiapp

# Or download ZIP and extract
```

### Step 2: Install Backend Dependencies

```bash
npm install
```

This installs all Node.js packages including NestJS, TypeORM, and dependencies.

### Step 3: Verify Node.js Installation

```bash
node --version
npm --version
```

Should display versions v16+ and 7+ respectively.

---

## Setup Instructions

### Backend Setup

#### 1. NestJS Backend Configuration

The backend is pre-configured to connect to MySQL with these settings:

- **Host**: localhost
- **Port**: 3306
- **Username**: root
- **Password**: (empty - WAMP default)
- **Database**: inventory_db
- **Synchronize**: true (auto-creates schema)

**File**: `src/app.module.ts`

Options are defined in the database configuration. Modify if your setup differs.

#### 2. Verify Backend Can Start

```bash
npm run start:dev
```

Expected output:
```
[Nest] 1234  - 04/06/2026, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 1234  - 04/06/2026, 10:00:01 AM     LOG [InstanceLoader] TypeOrmModule dependencies initialized...
[Nest] 1234  - 04/06/2026, 10:00:01 AM     LOG [InstanceLoader] ItemsModule dependencies initialized...
[Nest] 1234  - 04/06/2026, 10:00:01 AM     LOG [NestApplication] Nest application successfully started
[Nest] 1234  - 04/06/2026, 10:00:01 AM     LOG Application listening on port 3000
```

If error occurs:
- ❌ **"EADDRINUSE: address already in use :::3000"** → Port 3000 is in use. Free it or kill process on port 3000
- ❌ **"connect ECONNREFUSED 127.0.0.1:3306"** → MySQL not running. Start WAMP MySQL
- ❌ **"Access denied for user 'root'@'localhost'"** → MySQL password wrong. Check WAMP setup

### Frontend Setup

The frontend is static HTML/CSS/TypeScript files. No build step required.

#### 1. Frontend Files

All frontend files are in the `frontend/` directory:
- `frontend/index.html` - Inventory list
- `frontend/add-item.html` - Add new item
- `frontend/edit-item.html` - Edit existing item
- `frontend/css/styles.css` - Styling
- `frontend/js/api.ts` - API client code
- `frontend/js/inventory.ts` - Business logic

#### 2. TypeScript Files

Frontend TypeScript files (`.ts`) need to be compiled to JavaScript (`.js`) before the browser can load them.

**Option A: Browser ES Modules (Recommended for Development)**
- Save `.ts` files
- TypeScript compiles in-place or via build tool
- Browser loads from `frontend/js/` folder

**Option B: Build Tools (Vite, Webpack)**
- Set up a frontend build tool if needed
- Not required for this simple project

#### 3. Frontend Configuration

Edit `frontend/js/api.ts` with your backend URL:

```typescript
const API_BASE_URL = 'http://localhost:3000';
```

This is the base URL for all API calls. Ensure port 3000 matches your backend.

### MySQL/WAMP Setup

#### 1. Install WAMP

Download and install [WAMP Server](https://www.wampserver.com/)

WAMP includes:
- Apache (web server)
- MySQL (database)
- PHP (optional for this project)

#### 2. Start MySQL via WAMP

1. Click WAMP system tray icon
2. Select `MySQL` → `Start/Restart`
3. Icon turns green when MySQL is running
4. Verify in WAMP menu → Status

#### 3. MySQL Default Credentials

WAMP provides MySQL with:
- **Username**: root
- **Password**: (empty/blank)
- **Host**: localhost
- **Port**: 3306

#### 4. Create Database (Optional - Auto-Created)

The NestJS application with `synchronize: true` automatically creates the `inventory_db` database and `item` table on startup.

**Manual Creation** (if needed):

```bash
# Open MySQL CLI via WAMP
# Or use MySQL Workbench if installed

mysql -u root -h localhost
```

```sql
CREATE DATABASE inventory_db;
USE inventory_db;
```

#### 5. Verify MySQL Connection

```bash
mysql -u root -h localhost -e "SELECT 1;"
```

Output: `1` means MySQL is running and accessible.

#### 6. WAMP PhpMyAdmin (Database GUI)

- Access: http://localhost/phpmyadmin/
- Browse and manage `inventory_db` database
- View `item` table and data
- Useful for debugging

---

## Running the Application

### Start Backend

```bash
# Development mode with auto-reload
npm run start:dev
```

Or:

```bash
# Production build then start
npm run build
npm run start
```

**Expected**: Server runs on http://localhost:3000

### Open Frontend

1. **With Backend Serving Frontend** (if configured):
   - Navigate to: http://localhost:3000/frontend/index.html

2. **Serving Frontend Separately**:
   - Use a local file server or your IDE's live server
   - Navigate to your frontend URL

3. **Direct File Access** (limited):
   - Open `frontend/index.html` directly in browser
   - May have CORS issues with Fetch API
   - Not recommended

### Verify Both Are Running

**Backend Check**:
```bash
curl http://localhost:3000/items
```
Should return: `[]` (empty array) or list of items

**Frontend Check**:
- Open http://localhost:3000/frontend/index.html
- Page should load
- Click "Add New Item" button
- Form should appear

---

## API Overview

### Base URL
```
http://localhost:3000
```

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/items` | Get all items |
| GET | `/items/:id` | Get single item |
| POST | `/items` | Create new item |
| PATCH | `/items/:id` | Update item |
| DELETE | `/items/:id` | Delete item |

### Example Requests

**Get all items**:
```bash
curl http://localhost:3000/items
```

**Create item**:
```bash
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","quantity":5,"category":"Electronics","description":"Dell XPS"}'
```

**Update item**:
```bash
curl -X PATCH http://localhost:3000/items/1 \
  -H "Content-Type: application/json" \
  -d '{"quantity":10}'
```

**Delete item**:
```bash
curl -X DELETE http://localhost:3000/items/1
```

For detailed API documentation, see [docs/20-api.template.md](docs/20-api.template.md)

---

## Usage Guide

### Adding an Item

1. Click **"Add New Item"** button on inventory page
2. Fill in form fields:
   - **Name**: Item name (e.g., "Laptop")
   - **Quantity**: Number in stock (e.g., 5)
   - **Category**: Category name (e.g., "Electronics")
   - **Description**: Item description (e.g., "Dell XPS 13")
3. Click **"Add Item"** button
4. Item added successfully → redirects to inventory list
5. New item appears in table

### Viewing Items

1. **Inventory List**: Home page shows all items in a table
   - Columns: ID, Name, Quantity, Category, Description, Created, Actions
   - Items sorted by creation date
   - Timestamps shown in human-readable format

2. **Item Details**: Click item name or "View" to see full details

### Editing an Item

1. Click **"Edit"** button next to item
2. Form pre-fills with current values
3. Modify fields you want to change
4. Click **"Update Item"** button
5. Changes saved → redirects to inventory
6. Item updated in table

### Deleting an Item

1. Click **"Delete"** button next to item
2. Confirm deletion in popup dialog
3. Item permanently removed from inventory
4. Table refreshes immediately

### Form Validation

- **Name**: Required, cannot be empty
- **Quantity**: Required, must be 0 or positive number
- **Category**: Required, cannot be empty
- **Description**: Required, cannot be empty

Invalid inputs show red error messages. Fix and resubmit.

---

## Troubleshooting

### Backend Issues

#### ❌ "Port 3000 is already in use"

**Problem**: Another application is using port 3000

**Solutions**:
```bash
# macOS/Linux: Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Windows: In PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or change NestJS port in src/main.ts
```

#### ❌ "Cannot connect to database"

**Problem**: MySQL not running or wrong credentials

**Solutions**:
1. Start MySQL via WAMP (System tray → MySQL → Start)
2. Verify MySQL running: `mysql -u root -h localhost -e "SELECT 1;"`
3. Check database credentials in `src/app.module.ts`
4. Ensure database `inventory_db` exists

#### ❌ Dependencies not installing

**Problem**: npm install fails

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Frontend Issues

#### ❌ "Failed to fetch" error in browser console

**Problem**: Frontend cannot reach backend

**Solutions**:
1. Verify backend is running: `npm run start:dev`
2. Check backend is on http://localhost:3000
3. Verify CORS is enabled in `src/main.ts`
4. Check browser console for specific error message

#### ❌ Page shows blank or 404

**Problem**: Frontend files not accessible

**Solutions**:
1. Verify frontend files exist in `frontend/` directory
2. Ensure backend serves static files from `frontend/`
3. Check file paths in HTML links and imports
4. Try accessing directly: http://localhost:3000/frontend/index.html

#### ❌ API calls returning 500 error

**Problem**: Server-side error processing request

**Solutions**:
1. Check backend console for error message
2. Verify request format (JSON structure, field names)
3. Check database connection in backend console
4. Restart backend: `npm run start:dev`

### Database Issues

#### ❌ "Unknown database 'inventory_db'"

**Problem**: Database not created

**Solutions**:
1. Restart backend (TypeORM creates DB with `synchronize: true`)
2. Manually create database:
   ```sql
   CREATE DATABASE inventory_db;
   ```
3. Verify MySQL is running

#### ❌ "Access denied for user 'root'@'localhost'"

**Problem**: MySQL password wrong or user doesn't exist

**Solutions**:
1. Reset MySQL root user in WAMP
2. Verify WAMP default (root, no password)
3. Update credentials in `src/app.module.ts` if different

#### ❌ Data not persisting between restarts

**Problem**: Database not saving changes

**Solutions**:
1. Verify MySQL is running
2. Check database connection logs
3. Manually verify data: `mysql -u root -e "USE inventory_db; SELECT * FROM item;"`

### TypeScript/Compilation Issues

#### ❌ "Cannot find module" error

**Problem**: TypeScript files not compiling correctly

**Solutions**:
```bash
# Recompile
npm run build

# Check TypeScript config
cat tsconfig.json

# Verify node_modules folder exists
ls node_modules
```

---

## Notes and Assumptions

### Design Assumptions

1. **Single User**: System assumes one local user (no authentication)
2. **Local Network**: Backend and frontend on same machine
3. **WAMP MySQL**: Uses default WAMP MySQL (root, no password)
4. **Modern Browser**: Frontend requires modern browser with ES6+ support
5. **Port Availability**: Port 3000 and 3306 available
6. **Auto-Schema Sync**: Database schema auto-created on startup

### System Constraints

- **No Pagination**: All items loaded in memory (suitable for < 10,000 items)
- **No Search/Filter**: Must scroll to find items
- **No Undo**: Deleted items permanently gone (no recovery)
- **No Real-time Sync**: Multiple tabs don't sync automatically
- **No File Uploads**: No image or document attachments
- **No Concurrent Editing**: Last update wins if edited simultaneously
- **Local Development Only**: Not suitable for production deployment

### Production Deployment Notes

🚨 **DO NOT deploy this to production without:**

- Disabling `synchronize: true` (use migrations)
- Implementing authentication and authorization
- Using environment variables for secrets
- Restricting CORS to specific origins
- Adding HTTPS/TLS
- Hiding database credentials
- Adding input validation and sanitization
- Implementing error logging and monitoring
- Adding rate limiting
- Database backups and recovery
- Performance optimization (caching, pagination)
- Security hardening (OWASP top 10)

This project is **designed for local development only**.

### Browser Compatibility

- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ Internet Explorer (not supported)

### File Size Estimates

- Frontend HTML: ~50 KB total
- Frontend CSS: ~10 KB
- Frontend JavaScript: ~20 KB (compiled TS)
- Backend Code: ~100 KB (compiled)
- Database: Negligible (grows with items)

### Performance Expectations

- **API Response Time**: < 100ms (local network)
- **Page Load Time**: 1-3 seconds (first load)
- **Form Submission**: 0.5-1 second
- **Database Query**: < 10ms (small dataset)

---

## Getting Help

### Common Questions

**Q: How do I change the database password?**
A: Update credentials in `src/app.module.ts` TypeORM config, or change WAMP MySQL user password.

**Q: Can I use PostgreSQL instead of MySQL?**
A: Yes, modify TypeORM config in `src/app.module.ts` and install `pg` driver.

**Q: How do I deploy this to production?**
A: See "Notes and Assumptions" → "Production Deployment Notes" section or [docs/decisions.template.md](docs/decisions.template.md).

**Q: Can I add user authentication?**
A: Yes, requires implementing JWT or session-based auth. Out of scope for this project.

**Q: Why does the page reload instead of using AJAX?**
A: Multi-page architecture (not SPA). Can be converted to SPA with React/Vue if desired.

### Additional Resources

- **NestJS Docs**: https://docs.nestjs.com/
- **TypeORM Docs**: https://typeorm.io/
- **MySQL Docs**: https://dev.mysql.com/doc/
- **Fetch API**: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- **TypeScript Docs**: https://www.typescriptlang.org/docs/

---

## License

This project is provided as-is for educational purposes. Modify and use as needed.

---

## Project Documentation

Additional documentation files available in the `docs/` folder:

- **[docs/00-context.template.md](docs/00-context.template.md)** - Project context and overview
- **[docs/10-requirements.template.md](docs/10-requirements.template.md)** - Detailed requirements
- **[docs/20-api.template.md](docs/20-api.template.md)** - Complete REST API documentation
- **[docs/30-invariants.template.md](docs/30-invariants.template.md)** - System invariants and rules
- **[docs/40-acceptance.template.md](docs/40-acceptance.template.md)** - Feature acceptance criteria
- **[docs/50-edge-cases.template.md](docs/50-edge-cases.template.md)** - Edge cases and failure scenarios
- **[docs/decisions.template.md](docs/decisions.template.md)** - Design and implementation decisions
- **[docs/submission-reflection.template.md](docs/submission-reflection.template.md)** - Project reflection

---

**Last Updated**: April 6, 2026  
**Version**: 1.0.0

Happy inventory managing! 📦
