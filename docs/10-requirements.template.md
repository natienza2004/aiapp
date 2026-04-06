# Requirements Document

## Overview
This document details all functional and non-functional requirements for the Simple Inventory System. Requirements are separated into backend, frontend, and database categories, with clear distinction between must-have and nice-to-have features.

## Functional Requirements

### FR-1: View All Items
- **Description**: Users must be able to retrieve and display a complete list of all inventory items
- **Acceptance**: Item table displays all stored items with complete data
- **API Endpoint**: `GET /items`
- **Response**: Array of item objects with all fields
- **Must-Have**: Yes

### FR-2: View Item Details
- **Description**: Users must be able to view detailed information for a specific item
- **Acceptance**: When selecting an item, all fields are displayed correctly
- **API Endpoint**: `GET /items/:id`
- **Response**: Single item object with complete data
- **Must-Have**: Yes

### FR-3: Add New Item
- **Description**: Users must be able to create new inventory items with required fields
- **Acceptance**: New item appears in inventory list immediately after creation
- **Required Fields**: name, quantity, category, description
- **API Endpoint**: `POST /items`
- **Request Body**: `{ name, quantity, category, description }`
- **Response**: Created item object with id and createdAt
- **Must-Have**: Yes

### FR-4: Update Item
- **Description**: Users must be able to modify existing item properties including quantity and details
- **Acceptance**: Changes persist and reflect immediately in the UI
- **Updatable Fields**: name, quantity, category, description
- **API Endpoint**: `PATCH /items/:id`
- **Request Body**: Partial object with fields to update
- **Response**: Updated item object with current values
- **Must-Have**: Yes

### FR-5: Delete Item
- **Description**: Users must be able to remove items from inventory
- **Acceptance**: Deleted item no longer appears in the inventory list
- **API Endpoint**: `DELETE /items/:id`
- **Response**: HTTP 200 with success message or confirmation
- **Must-Have**: Yes

### FR-6: Navigate Between Pages
- **Description**: Users should be able to navigate between different pages (list, add, edit)
- **Acceptance**: Links between pages work and forms pre-populate correctly
- **Pages**: inventory list, add new item, edit existing item
- **Must-Have**: Yes

### FR-7: Form Validation
- **Description**: System should validate user input before submission
- **Acceptance**: Invalid submissions are rejected with clear error messages
- **Validations**:
  - Name: required, non-empty
  - Quantity: required, must be non-negative integer
  - Category: required, non-empty
  - Description: required, non-empty
- **Must-Have**: Yes

### FR-8: Pre-populate Edit Form
- **Description**: When editing an item, the form should load current values
- **Acceptance**: All fields in edit form match the item's current values
- **Trigger**: Clicking edit button on an item
- **Must-Have**: Yes

### FR-9: Display Timestamps
- **Description**: System should display when items were created
- **Acceptance**: `createdAt` field is visible in item list and details
- **Format**: Human-readable date format
- **Must-Have**: Yes (for audit trail)

## Non-Functional Requirements

### NFR-1: Performance
- **Description**: API responses must be fast and UI must be responsive
- **Acceptance Criteria**:
  - Item list loads in < 1 second for up to 1000 items
  - CRUD operations complete in < 500ms
  - Frontend renders within < 100ms

### NFR-2: Reliability
- **Description**: System must handle common failure scenarios gracefully
- **Acceptance Criteria**:
  - API returns appropriate error codes (4xx, 5xx)
  - Database connection failures show user-friendly messages
  - Frontend handles API timeouts

### NFR-3: Usability
- **Description**: System must be intuitive and easy to navigate
- **Acceptance Criteria**:
  - Clear button labels and form fields
  - Intuitive navigation between pages
  - Visible feedback for successful operations
  - Clear error messages for failed operations

### NFR-4: Maintainability
- **Description**: Code must be structured and documented for future modifications
- **Acceptance Criteria**:
  - Controllers separate from services
  - DTOs for all request/response data
  - Comments on complex logic
  - Consistent naming conventions

### NFR-5: Scalability
- **Description**: System should support reasonable growth in item count
- **Acceptance Criteria**:
  - Supports at least 10,000 items without performance degradation
  - Database indexed on frequently queried fields
  - Pagination considered for large lists

### NFR-6: Security
- **Description**: System should protect data from common vulnerabilities (for local use)
- **Acceptance Criteria**:
  - CORS enabled for frontend-to-backend communication
  - SQL injection prevented through ORM usage
  - Input validation on all endpoints

## Backend Requirements

### BR-1: NestJS Framework
- **Description**: Backend must be built with NestJS and TypeScript
- **Version**: Latest stable
- **Module Structure**: items module with controller, service, entity, DTO

### BR-2: TypeORM Integration
- **Description**: Data persistence must use TypeORM ORM
- **Configuration**:
  - MySQL database
  - Auto-synchronization enabled (development mode)
  - Proper connection pooling

### BR-3: Database Connection
- **Description**: System must connect to MySQL using provided credentials
- **Configuration**:
  - Host: localhost
  - Port: 3306
  - Username: root
  - Password: (empty)
  - Database: inventory_db
  - Synchronize: true

### BR-4: REST API Compliance
- **Description**: API must follow REST conventions
- **Requirements**:
  - Proper HTTP methods (GET, POST, PATCH, DELETE)
  - Correct status codes (200, 201, 400, 404, 500)
  - JSON request/response format
  - Standard error response format

### BR-5: CORS Support
- **Description**: Backend must enable CORS for frontend access
- **Configuration**: Allow requests from any origin (for local development)

### BR-6: Error Handling
- **Description**: API must return meaningful error messages
- **Requirements**:
  - Item not found returns 404
  - Invalid data returns 400
  - Server errors return 500
  - Error responses include descriptive message

## Frontend Requirements

### FR-1: Static HTML Pages
- **Description**: Frontend UI must be built with HTML5
- **Pages**:
  - inventory list (`index.html`)
  - add new item (`add-item.html`)
  - edit existing item (`edit-item.html`)

### FR-2: Form UI
- **Description**: Forms must be usable and clearly labeled
- **Fields**: name, quantity, category, description
- **Submission**: Submit button with visual feedback
- **Validation**: Client-side validation before submission

### FR-3: Item List Display
- **Description**: Items must be displayed in a clear, organized format
- **Format**: HTML table preferred
- **Columns**: id, name, quantity, category, description, createdAt, actions
- **Actions**: View details, Edit, Delete buttons

### FR-4: CSS Styling
- **Description**: Frontend must be styled with CSS3
- **Requirements**:
  - Professional appearance
  - Responsive layout (if possible)
  - Clear visual hierarchy
  - Accessible font sizes and colors

### FR-5: TypeScript Implementation
- **Description**: Frontend logic must use TypeScript
- **Modules**:
  - `api.ts`: HTTP calls to backend
  - `inventory.ts`: UI logic and interactions
- **Type Safety**: Types/interfaces for API responses

### FR-6: Fetch API Integration
- **Description**: Frontend must use Fetch API for HTTP requests
- **Requirements**:
  - Proper error handling
  - Loading states
  - Success/failure messaging

## Database Requirements

### DBR-1: Item Entity
- **Description**: Items must be stored with the specified fields
- **Fields**:
  - `id`: Auto-incrementing primary key
  - `name`: String, required
  - `quantity`: Number (positive integer), required
  - `category`: String, required
  - `description`: String, required
  - `createdAt`: Timestamp, auto-set on creation

### DBR-2: Auto Schema Creation
- **Description**: Database schema must be created automatically
- **Method**: TypeORM synchronize: true
- **Behavior**: Tables created on application startup if not present

### DBR-3: Data Integrity
- **Description**: Database must enforce data consistency
- **Requirements**:
  - id is unique
  - All required fields have values
  - Timestamps are automatically managed
  - Deleted items are permanently removed

### DBR-4: MySQL Compatibility
- **Description**: Database must work with WAMP MySQL installation
- **Compatibility**: Standard MySQL 5.7+ or MariaDB

## Summary of Must-Have Requirements

| Category | Requirement | Status |
|----------|------------|--------|
| **Backend** | NestJS with TypeScript | Must-Have |
| **Backend** | TypeORM integration | Must-Have |
| **Backend** | MySQL connection | Must-Have |
| **Backend** | GET /items endpoint | Must-Have |
| **Backend** | GET /items/:id endpoint | Must-Have |
| **Backend** | POST /items endpoint | Must-Have |
| **Backend** | PATCH /items/:id endpoint | Must-Have |
| **Backend** | DELETE /items/:id endpoint | Must-Have |
| **Backend** | CORS enabled | Must-Have |
| **Frontend** | Item list page | Must-Have |
| **Frontend** | Add item page | Must-Have |
| **Frontend** | Edit item page | Must-Have |
| **Frontend** | HTML forms for all operations | Must-Have |
| **Frontend** | Fetch API integration | Must-Have |
| **Frontend** | CSS styling | Must-Have |
| **Database** | Item table with specified fields | Must-Have |
| **Database** | Auto schema creation | Must-Have |

## Nice-to-Have Requirements (Out of Scope)

- Search/filter functionality
- Sort by different columns
- Bulk operations
- Pagination for large lists
- Data export (CSV, Excel)
- Item images or attachments
- User authentication
- Audit logs beyond createdAt
- API documentation (Swagger)
- Unit tests and e2e tests
