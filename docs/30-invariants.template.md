# System Invariants

## Definition
System invariants are rules and properties that must always remain true throughout the application's lifetime. They represent the core business logic and data integrity constraints that cannot be violated.

---

## Data Integrity Invariants

### I-1: Item ID Uniqueness
**Invariant**: Every item in the system has a unique ID that never changes.

**Rules**:
- No two items may have the same ID
- ID is assigned only once when item is created
- ID cannot be modified after creation
- ID is a positive integer

**Enforcement**:
- Database primary key constraint
- TypeORM auto-increment on INSERT
- API rejects manual ID changes

**Violations Prevent**:
- Duplicate records in inventory
- Data loss from ID collisions

---

### I-2: Required Fields Presence
**Invariant**: Every item must have all required fields populated with valid values.

**Required Fields**:
- `name`: Must be non-empty string
- `quantity`: Must be a number
- `category`: Must be non-empty string
- `description`: Must be non-empty string
- `id`: Must be unique positive integer
- `createdAt`: Must be a valid timestamp

**Rules**:
- No field may be null or undefined
- No field may be an empty string (except trailing spaces)
- String fields must not exceed database column limits

**Enforcement**:
- Database NOT NULL constraints
- Validation in `CreateItemDTO` and `UpdateItemDTO`
- API returns 400 error for missing required fields

**Violations Prevent**:
- Incomplete or unusable inventory records
- Undefined behavior in frontend when displaying items

---

### I-3: Quantity Validity
**Invariant**: Item quantity must always be a non-negative integer.

**Rules**:
- Quantity >= 0 (cannot be negative)
- Quantity must be an integer (no decimals)
- Quantity must be a valid number (not NaN or Infinity)
- Zero quantity is allowed (out of stock items)

**Enforcement**:
- Validation in `CreateItemDTO` max/min constraints
- Update validation checks quantity bounds
- Database column type: INTEGER UNSIGNED

**Violations Prevent**:
- Nonsensical inventory levels
- Frontend calculation errors
- Ordering issues when selling items

---

### I-4: Created Timestamp Immutability
**Invariant**: The `createdAt` field is set once on creation and never changes.

**Rules**:
- `createdAt` is set to current UTC timestamp when item is created
- `createdAt` cannot be modified by update operations
- `createdAt` cannot be set manually during creation
- `createdAt` must be a valid ISO8601 timestamp

**Enforcement**:
- Database `DEFAULT CURRENT_TIMESTAMP` on col
- API ignores `createdAt` in PATCH update requests
- TypeORM `@CreateDateColumn()` decorator

**Violations Prevent**:
- Loss of audit trail
- Inability to track when items were added
- Timestamp inconsistencies

---

### I-5: Deleted Items Removal
**Invariant**: Once an item is deleted, it is permanently removed from the system.

**Rules**:
- DELETE operation removes all item data from database
- No soft delete or archiving (hard delete only)
- Deleted item is no longer returned by any API endpoint
- Subsequent requests for deleted item ID return 404

**Enforcement**:
- TypeORM `remove()` performs hard delete
- No "deleted_at" field or flag
- Database foreign key constraints (if parent tables exist)

**Violations Prevent**:
- Zombie data in inventory
- Unexpected item reappearance
- Confusion in user count of items

---

## API Contract Invariants

### I-6: Response Structure Consistency
**Invariant**: All API responses follow a consistent JSON structure.

**Rules**:
- GET /items returns array of item objects
- GET /items/:id returns single item object
- POST /items returns created item with ID and createdAt
- PATCH /items/:id returns updated item with all fields
- DELETE /items/:id returns success message object
- Error responses include statusCode and message

**Format**:
- All successful responses include complete item object or array
- All error responses follow: `{ "statusCode": number, "message": string }`
- All timestamps in ISO8601 format
- All IDs as positive integers

**Enforcement**:
- REST controller mappings
- Response serialization in NestJS
- DTOs enforce structure in serialization

**Violations Prevent**:
- Frontend parsing errors
- Inconsistent error handling
- API consumer confusion

---

### I-7: HTTP Status Code Correctness
**Invariant**: HTTP responses use correct status codes matching operation results.

**Rules**:
- 200 OK: Successful GET, PATCH, DELETE operations
- 201 Created: Successful POST operation (item created)
- 400 Bad Request: Invalid input, missing required fields, validation failure
- 404 Not Found: Item ID does not exist
- 500 Internal Server Error: Unhandled server error or database failure

**Enforcement**:
- NestJS controller method routing
- Explicit status code setting in responses
- Error handling middleware

**Violations Prevent**:
- HTTP clients misinterpreting operation success/failure
- Invalid caching behavior in proxies
- Frontend handling errors as successes

---

### I-8: Field Name Consistency
**Invariant**: Field names remain consistent between frontend and backend.

**Rules**:
- Backend uses: `id`, `name`, `quantity`, `category`, `description`, `createdAt`
- Frontend must use identical field names when sending/receiving data
- No field name changes or aliases between frontend and API
- All field names use camelCase

**Enforcement**:
- TypeORM entity definition with exact field names
- DTOs specify field names explicitly
- Frontend TypeScript types match API contracts

**Violations Prevent**:
- Frontend-backend data mapping errors
- Silent failures when parsing API responses
- Build-time type errors in TypeScript

---

## Business Logic Invariants

### I-9: Item Uniqueness by ID, Not Name
**Invariant**: Items are uniquely identified by ID, not by name.

**Rules**:
- Multiple items can have the same name
- Multiple items can have the same category
- Only ID guarantees item uniqueness
- Two different items may have identical names, quantities, and categories

**Enforcement**:
- Only ID is primary key
- No unique constraint on name or other fields
- API uses ID for all lookups, updates, deletes

**Violations Prevent**:
- Inability to stock multiple brands of same product
- Confusion when searching by name

---

### I-10: No Custom Metadata Fields
**Invariant**: Items have exactly the defined fields; no arbitrary metadata fields are stored.

**Rules**:
- Only these fields exist on items: `id`, `name`, `quantity`, `category`, `description`, `createdAt`
- No custom attributes or tags stored
- No user-defined fields or key-value pairs
- No nested objects or relationships

**Enforcement**:
- TypeORM entity with explicit columns
- API validation rejects unknown fields
- Frontend bound to known fields by types

**Violations Prevent**:
- Scope creep into unplanned features
- Data model inconsistency
- Front-end confusion about available fields

---

## Frontend-Backend Contract Invariants

### I-11: API Base URL Consistency
**Invariant**: Frontend communicates with backend only via the agreed-upon base URL.

**Rules**:
- Base URL: `http://localhost:3000`
- All API calls use this base URL
- Port must be 3000 (not 3001, 5000, etc.)
- Protocol is HTTP (not HTTPS) for local development

**Enforcement**:
- Frontend hardcodes or centralizes base URL in `api.ts`
- NestJS runs on port 3000 (main.ts listen)

**Violations Prevent**:
- Frontend unable to reach backend
- Configuration management issues
- Deployment confusion

---

### I-12: CORS Compatibility
**Invariant**: Backend CORS configuration allows frontend requests from localhost.

**Rules**:
- Backend enables CORS for all origins (development)
- Frontend requests include appropriate headers
- Preflight OPTIONS requests are handled
- No authentication headers required (for local access)

**Enforcement**:
- NestJS CORS middleware enabled
- `main.ts` calls `app.enableCors()`

**Violations Prevent**:
- Frontend CORS errors
- Failed API requests from browser
- Inability to develop locally

---

## Data Consistency Invariants

### I-13: No Orphaned Data
**Invariant**: Database contains no orphaned or unreferenced records.

**Rules**:
- Every item record has valid id
- No missing foreign key references (if relationships added)
- No deleted parent records with child references

**Enforcement**:
- Hard deletion of items (no orphans left)
- TypeORM cascading delete (if needed)
- Database constraints

**Violations Prevent**:
- Database corruption
- Invalid data relationships
- Query failures

---

### I-14: Atomic Operations
**Invariant**: All item operations (create, update, delete) are atomic.

**Rules**:
- Item creation: either fully created or not created at all
- Item update: either fully updated or not updated at all
- Item deletion: either fully deleted or not deleted at all
- No partial states (e.g., name updated but quantity not)

**Enforcement**:
- Database transaction support
- TypeORM repository operations
- No manual split operations

**Violations Prevent**:
- Inconsistent item states
- Data corruption
- Lost updates

---

## Validation Invariants

### I-15: Input Validation Consistency
**Invariant**: All user inputs are validated consistently across the system.

**Rules**:
- Same validation rules applied in frontend (UX) and backend (security)
- Backend validation is authoritative (frontend is for UX only)
- Invalid inputs rejected before database operations
- Validation rules documented and consistent

**Enforcement**:
- DTOs with validators on backend
- Frontend form validation with matching rules
- Shared validation constants if possible

**Violations Prevent**:
- Security vulnerabilities
- Invalid data in database
- Poor user experience

---

## Summary Table

| ID | Invariant | Type | Critical |
|-------|-----------|------|----------|
| I-1 | Item ID Uniqueness | Data | Yes |
| I-2 | Required Fields Presence | Data | Yes |
| I-3 | Quantity Validity | Data | Yes |
| I-4 | Created Timestamp Immutability | Data | Yes |
| I-5 | Deleted Items Removal | Data | Yes |
| I-6 | Response Structure Consistency | API | Yes |
| I-7 | HTTP Status Code Correctness | API | Yes |
| I-8 | Field Name Consistency | API | Yes |
| I-9 | Item Uniqueness by ID | Business | No |
| I-10 | No Custom Metadata Fields | Business | No |
| I-11 | API Base URL Consistency | Contract | Yes |
| I-12 | CORS Compatibility | Contract | Yes |
| I-13 | No Orphaned Data | Consistency | Yes |
| I-14 | Atomic Operations | Consistency | Yes |
| I-15 | Input Validation Consistency | Validation | Yes |

---

## Testing Invariants

To ensure invariants are maintained:

1. **Unit Tests**: Test validation logic in services
2. **Integration Tests**: Test database operations maintain constraints
3. **E2E Tests**: Test full user workflows preserve invariants
4. **Manual Testing**: Verify invariants with edge case inputs
5. **Code Review**: Verify new code doesn't violate invariants

All code changes must preserve every invariant listed above.
