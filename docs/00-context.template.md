# Project Context

## Project Title
**Simple Inventory System**

## Project Overview
A lightweight, locally-deployable inventory management application built with modern web technologies. The system provides core stock management functionality with a clean separation between backend API and frontend UI.

## Purpose of the System
To provide a straightforward solution for managing inventory items, allowing users to track product stock levels, categories, and metadata through a simple web interface backed by a REST API and relational database.

## Target Users
- Small business owners
- Inventory managers
- Stock keepers
- Development learners studying NestJS and REST APIs

## Problem Being Solved
- **Stock tracking**: Users need a reliable way to view and manage current inventory levels
- **Item management**: Create, read, update, and delete inventory items efficiently
- **Categorization**: Organize items by category for easier navigation
- **Audit trail**: Track when items were added to the system with `createdAt` timestamps

## Project Scope

### In Scope
- CRUD operations for inventory items
- Item categorization
- Quantity management
- Item details (name, quantity, category, description)
- Web-based UI for non-technical users
- REST API for programmatic access

### Out of Scope
- User authentication and authorization
- Role-based access control
- Multi-warehouse inventory
- Purchase orders or supplier management
- Real-time stock notifications
- Advanced reporting and analytics
- Mobile application

## Tech Stack Summary

| Component | Technology |
|-----------|-----------|
| **Backend Framework** | NestJS with TypeScript |
| **Backend Language** | TypeScript |
| **Database** | MySQL |
| **ORM/Data Access** | TypeORM |
| **Frontend Framework** | Vanilla TypeScript |
| **Frontend Markup** | HTML5 |
| **Frontend Styling** | CSS3 |
| **HTTP Client** | Fetch API |
| **API Architecture** | REST |
| **Server Environment** | Node.js |
| **Database Environment** | WAMP (Windows + Apache + MySQL + PHP) |

## Assumptions and Constraints

### Assumptions
1. **Local Development**: The system is designed to run locally on a single developer's machine
2. **Single User**: No concurrent multi-user access or locking mechanisms implemented
3. **WAMP Stack**: MySQL is deployed via WAMP for easy Windows compatibility
4. **Modern Browser**: Frontend assumes a modern browser with ES6+ support and Fetch API
5. **Port Availability**: Port 3000 assumed available for NestJS backend, port 3306 for MySQL
6. **Empty Password**: MySQL root user configured with no password (standard WAMP default)
7. **Development Environment**: Not designed for production deployment

### Constraints
1. **Simplicity First**: Code should be minimal and easy to understand
2. **No External UI Libraries**: Frontend uses only vanilla HTML/CSS/TypeScript
3. **No Authentication Required**: System assumes trusted local environment
4. **Synchronous TypeORM Sync**: `synchronize: true` enables auto-migration (not for production)
5. **File Uploads Not Supported**: No image or document storage for items
6. **No Validation Beyond Basic Types**: Minimal input validation
7. **English Only**: UI and documentation in English only

## Key Goals
1. ✓ Provide a working end-to-end inventory system
2. ✓ Demonstrate NestJS + TypeORM integration
3. ✓ Show REST API design patterns
4. ✓ Create a functional web interface
5. ✓ Run entirely on local infrastructure
6. ✓ Keep codebase simple and maintainable
7. ✓ Enable easy deployment on WAMP stack

## Success Criteria
- [x] All CRUD endpoints implemented and functional
- [x] Database automatically creates and syncs schema
- [x] Frontend can add, view, edit, and delete items
- [x] System runs on WAMP with MySQL
- [x] Code is readable and follows NestJS conventions
- [x] Project can be initialized, built, and run locally
