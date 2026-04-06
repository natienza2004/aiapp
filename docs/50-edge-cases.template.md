# Edge Cases and Failure Scenarios

## Overview
This document identifies realistic edge cases and failure scenarios that may occur during normal or abnormal operation. Each edge case includes the scenario, expected behavior, and implementation notes.

---

## Input Data Edge Cases

### EC-1: Empty Name Field

**Scenario**: User submits form with empty or whitespace-only name

**Input**: `name: ""` or `name: "   "`

**Expected Behavior**:
- Frontend validation prevents submission
- If submitted, backend returns 400 Bad Request
- Error message: "Name cannot be empty"
- Item is not created

**Implementation Notes**:
- Trim whitespace before validation
- Treat pure whitespace as empty
- Backend validates independently

### EC-2: Very Long Item Name

**Scenario**: User enters extremely long name (beyond reasonable limit)

**Input**: `name: "A" * 5000` (5000 characters)

**Expected Behavior**:
- Frontend may show character limit (max 255 chars)
- If sent to backend, receives 400 Bad Request
- Error message: "Name exceeds maximum length (255 characters)"
- Item is not created

**Implementation Notes**:
- Database VARCHAR limit: 255 characters
- Frontend should warn user at ~240 chars
- Backend strictly enforces limit

### EC-3: Special Characters in Name

**Scenario**: User enters special characters in item name

**Input**: `name: "<script>alert('xss')</script>"` or `name: "Item's \"Name\""`

**Expected Behavior**:
- Special characters are accepted (not XSS vector due to proper escaping)
- Item created with special chars preserved
- Frontend properly escapes when displaying
- Database stores literal characters

**Implementation Notes**:
- No special character filtering on input
- Proper output escaping in frontend (innerHTML avoidance)
- TypeORM ORM prevents SQL injection

### EC-4: Unicode and Emoji in Description

**Scenario**: User enters emoji or non-ASCII characters

**Input**: `description: "特殊な説明 😀🎉"`

**Expected Behavior**:
- Unicode characters accepted and stored correctly
- Frontend displays emoji and special chars properly
- No data corruption or encoding issues

**Implementation Notes**:
- MySQL configured with UTF-8 encoding
- Frontend HTML charset: UTF-8
- TypeORM handles Unicode automatically

### EC-5: Negative Quantity

**Scenario**: User attempts to enter negative stock count

**Input**: `quantity: -5`

**Expected Behavior**:
- Frontend validation shows error immediately
- If sent, backend returns 400 Bad Request
- Error: "Quantity must be non-negative (>= 0)"
- Item not created/updated

**Implementation Notes**:
- Check quantity >= 0
- Frontend HTML5 input type number with min="0"
- Backend DTO validation enforces rule

### EC-6: Zero Quantity

**Scenario**: User creates item with quantity 0

**Input**: `quantity: 0`

**Expected Behavior**:
- Item accepted and created successfully
- Quantity 0 represents "out of stock"
- Item appears in inventory with qty 0
- Can be updated to positive quantity later

**Implementation Notes**:
- Zero is a valid inventory state
- No special database handling needed
- Display may show "Out of Stock" UI label

### EC-7: Decimal/Float Quantity

**Scenario**: User enters decimal number for quantity

**Input**: `quantity: 5.5`

**Expected Behavior**:
- Frontend validation prevents submission
- Error message: "Quantity must be a whole number"
- User cannot submit with decimals

**Implementation Notes**:
- HTML5 input type: number, step: 1
- Backend DTO uses integer/uint type
- Reject float values with validation error

### EC-8: Non-Numeric Quantity Input

**Scenario**: User enters text in quantity field

**Input**: `quantity: "abc"` or `quantity: "5 kg"`

**Expected Behavior**:
- Frontend HTML input type="number" prevents non-numeric
- If pasted as JSON, backend rejects with 400 Bad Request
- Error: "Quantity must be a number"

**Implementation Notes**:
- HTML5 input type="number" prevents non-numeric
- Backend validation checks type is number
- Coercion from string "5" to number 5 may happen

### EC-9: Very Large Quantity

**Scenario**: User enters extremely large inventory count

**Input**: `quantity: 9999999999999999` (beyond integer limits)

**Expected Behavior**:
- Database INT type limits max value (~2.1 billion)
- Values beyond limit rejected or truncated
- Backend validation should catch this
- Error message or capped to max int

**Implementation Notes**:
- MySQL INT range: -2,147,483,648 to 2,147,483,647
- Consider BIGINT if larger values needed
- Frontend validation can warn at 999,999,999

### EC-10: Empty Category Field

**Scenario**: User submits with empty category

**Input**: `category: ""`

**Expected Behavior**:
- Frontend validation prevents submission
- Error message: "Category is required"
- Item not created

**Implementation Notes**:
- Category is required field
- Treat whitespace as empty
- Backend validates independently

### EC-11: Very Long Description

**Scenario**: User enters extremely long description

**Input**: `description: "A" * 10000` (10,000 characters)

**Expected Behavior**:
- Database limit enforces max length (1000 chars assumed)
- If exceeded, backend returns 400 Bad Request
- Error: "Description exceeds maximum length (1000 characters)"
- Item not created

**Implementation Notes**:
- Database VARCHAR(1000) or TEXT
- Frontend should limit input/warn at ~950 chars
- Backend strictly enforces limit

### EC-12: Description Containing HTML

**Scenario**: User enters HTML tags in description

**Input**: `description: "<h1>Important</h1><iframe src='evil.com'></iframe>"`

**Expected Behavior**:
- HTML tags stored as plain text (not executed)
- Frontend displays safely (no innerHTML)
- No XSS vulnerability from user input

**Implementation Notes**:
- Store as-is in database
- Frontend uses textContent or properly escaped innerHTML
- No server-side HTML sanitization needed (for local use)

---

## Quantity and Stock Edge Cases

### EC-13: Update Item Quantity to Negative

**Scenario**: User tries to update existing item quantity to negative

**Input**: `PATCH /items/1` with `{ "quantity": -10 }`

**Expected Behavior**:
- Frontend validation prevents form submission
- If bypassed, backend returns 400 Bad Request
- Quantity not updated
- Item remains with previous quantity

**Implementation Notes**:
- Backend DTO validation enforces >= 0
- Frontend form validation as UX safeguard

### EC-14: Quantity Overflow on Update

**Scenario**: User updates quantity to extremely large number

**Input**: `PATCH /items/1` with `{ "quantity": 999999999999 }`

**Expected Behavior**:
- Backend receives large number
- If exceeds INT max, database error or coercion
- Should return error or cap value
- Item quantity unchanged

**Implementation Notes**:
- Backend should validate reasonable limits
- Frontend warns at suspicious numbers

### EC-15: Update Same Item Concurrently

**Scenario**: User updates same item from two tabs simultaneously

**Input**: 
- Tab 1: `PATCH /items/1` with `quantity: 100`
- Tab 2: `PATCH /items/1` with `quantity: 50`

**Expected Behavior**:
- Both requests processed sequentially
- Last update wins (Last Write Wins strategy)
- Second update overwrites first
- Items endpoint shows final state (qty 50)
- No data corruption, but data loss on first update

**Implementation Notes**:
- No locking or versioning for local app
- No race condition protection
- Acceptable for single-user local app
- Advanced: Could add timestamp-based versioning

---

## API and Database Edge Cases

### EC-16: Database Connection Failure

**Scenario**: MySQL database is not running or unreachable

**Input**: Any API request when DB offline

**Expected Behavior**:
- Backend cannot establish database connection
- API request times out or returns 500 Internal Server Error
- Error message: "Database connection failed" or "Service unavailable"
- Frontend shows error: "Unable to connect to server. Try again."

**Implementation Notes**:
- TypeORM connection pool handles retries
- Error handling middleware catches DB errors
- Frontend has timeout (5-10 seconds)
- Frontend provides "Retry" button

### EC-17: API Request Timeout

**Scenario**: Frontend request to backend takes too long

**Input**: `fetch()` call with slow/unresponsive backend

**Expected Behavior**:
- Frontend implements timeout (5 seconds suggested)
- Request aborts after timeout
- User sees error message: "Request took too long. Please try again."
- Frontend allows retry

**Implementation Notes**:
- Use AbortController for timeout
- Set timeout in fetch options
- Clear pending requests on timeout

### EC-18: Malformed JSON Response

**Scenario**: Backend returns invalid JSON

**Input**: API returns `{invalid json}` or HTML error page

**Expected Behavior**:
- Frontend JSON.parse() throws error
- Frontend catches and displays: "Invalid server response"
- Frontend allows retry
- No blank page or cryptic errors

**Implementation Notes**:
- Wrap response.json() in try-catch
- Validate response structure
- Provide fallback error messaging

### EC-19: API Response Missing Required Fields

**Scenario**: Backend returns item object missing required fields

**Input**: API returns `{ "id": 1, "name": "Item" }` (missing qty, category, etc.)

**Expected Behavior**:
- Frontend expects all 6 fields
- Should handle gracefully (show "N/A" or blank)
- Does not crash or show undefined values
- May log warning for debugging

**Implementation Notes**:
- Use TypeScript types to catch at compile time
- Runtime validation of response shape
- Defensive property access

### EC-20: Empty API Response

**Scenario**: API returns null or no data

**Input**: GET /items returns `null` instead of `[]`

**Expected Behavior**:
- Frontend treats as empty list
- Shows "No items" message
- Does not crash trying to iterate

**Implementation Notes**:
- Validate response is array
- Default to empty array if null/undefined

---

## Database and Data Edge Cases

### EC-21: Duplicate Item Creation (Race Condition)

**Scenario**: User clicks "Add Item" button twice quickly

**Input**: Two rapid POST requests for same item

**Expected Behavior**:
- Both requests processed
- Two separate items created (no duplicate detection)
- Each gets unique ID
- Both appear in inventory list

**Implementation Notes**:
- No unique constraint on name
- System allows multiple items with same name
- Frontend could disable button briefly after click
- Not a data corruption issue, just expected behavior

### EC-22: Item Deleted by Another User/Tab

**Scenario**: Item deleted by another browser tab before current tab updates

**Input**: Tab 1 deletes item, Tab 2 tries to edit same item

**Expected Behavior**:
- Tab 2 requests GET /items/5 after deletion
- Backend returns 404 Not Found
- Tab 2 shows: "Item not found or deleted"
- Tab 2 redirects to inventory list

**Implementation Notes**:
- No multi-user coordination needed
- 404 handling is sufficient
- User manually refreshes list

### EC-23: Very Fast Deletion and Recreation

**Scenario**: Delete item, immediately create new item with same name

**Input**: Delete item id 5, then create new "Widget" item

**Expected Behavior**:
- Item 5 deleted permanently
- New item created with new ID (e.g., id 6)
- Old ID (5) never reused
- No confusion between old and new item

**Implementation Notes**:
- IDs are auto-increment, never reused
- Even after deletion, ID counter continues
- Database AUTOINCREMENT property ensures this

---

## Frontend and Navigation Edge Cases

### EC-24: Accessing Edit Page Without Item ID

**Scenario**: User navigates to `edit-item.html` without ID parameter

**Input**: URL: `edit-item.html` (no query params or URL params)

**Expected Behavior**:
- Page detects missing ID
- Shows error: "No item selected"
- Provides link back to inventory list
- Does not crash or show blank form

**Implementation Notes**:
- Check for ID in URL before rendering form
- Parse query params or route params
- Fallback to inventory list

### EC-25: User Manually Enters Invalid ID in URL

**Scenario**: User types `edit-item.html?id=invalid-text` directly

**Input**: URL with non-numeric ID

**Expected Behavior**:
- Page loads but fetch for `/items/invalid-text` fails
- Backend returns 400 or 404
- Frontend shows: "Item not found"
- Link back to inventory
- No 500 error on frontend

**Implementation Notes**:
- Validate ID format on frontend
- Handle failed fetch gracefully
- Backend validates int ID

### EC-26: Back Button After Successful Add

**Scenario**: User adds item, redirects to list, then clicks browser back button

**Input**: User clicks browser back on inventory list after add

**Expected Behavior**:
- Goes to previous page (add-item form)
- Form may still have data (cached)
- User can navigate forward again
- Session intact

**Implementation Notes**:
- Browser history handling is automatic
- Form state may persist or clear (depends on implementation)
- Not a major issue for local app

### EC-27: Multiple Tabs/Windows

**Scenario**: User has inventory list open in two tabs

**Input**: User adds item in Tab 1

**Expected Behavior**:
- Tab 1 shows new item immediately
- Tab 2 still shows old list (outdated)
- User must refresh Tab 2 to see new item
- No sync mechanism between tabs

**Implementation Notes**:
- Local app, no auto-sync expected
- User manually refreshes to see updates
- Not a defect, acceptable for local development

### EC-28: Page Refresh During Form Submission

**Scenario**: User submits form and immediately refreshes page

**Input**: User presses F5 while POST request pending

**Expected Behavior**:
- Form submission may complete or be aborted
- Page refreshes to initial state
- If abo
rted, item may not be created
- If completed before refresh, item is created (user may not know)
- Next page load shows current state

**Implementation Notes**:
- Request-in-flight behavior depends on timing
- Frontend cannot reliably prevent refresh
- Item state is source of truth
- User can refresh list to verify

---

## Display and Formatting Edge Cases

### EC-29: Timestamp Display Across Time Zones

**Scenario**: Server in UTC, viewing from different timezone

**Input**: createdAt: "2026-04-06T10:30:00Z" (UTC)

**Expected Behavior**:
- Frontend displays ISO8601 or local format
- If converting to local, shows correct time offset
- Consistency across pages

**Implementation Notes**:
- Store as UTC in database
- Display as UTC (or convert with clear label)
- JavaScript Date handles conversion
- Consider: Show UTC time with "UTC" label to avoid confusion

### EC-30: Very Long Item Name Display in Table

**Scenario**: Item name is 255 characters long

**Input**: name: "A" * 255

**Expected Behavior**:
- Table displays entire name (may wrap or truncate)
- Text is readable (doesn't overflow container)
- All other columns remain visible
- No layout breaking

**Implementation Notes**:
- CSS: word-wrap or text-overflow
- Table responsive or scrollable
- Frontend shows full name on hover or detail page

### EC-31: Empty Description Display

**Scenario**: User creates item with minimal description

**Input**: `description: "."` (single character)

**Expected Behavior**:
- Description stored and displayed as-is
- No "N/A" substitution or default text
- Whatever user entered is shown

**Implementation Notes**:
- Store exactly what user input
- Display as-is in table/detail view

### EC-32: Table Rendering with Many Items

**Scenario**: Inventory contains 1,000 items

**Input**: GET /items returns 1,000 items

**Expected Behavior**:
- All items loaded in one page
- Page renders (may be slow)
- Table is scrollable
- No pagination needed for simple app
- Frontend may experience lag with large lists

**Implementation Notes**:
- Local app not optimized for large datasets
- Could add pagination/virtual scrolling if needed
- For 1,000 items, acceptable performance
- Beyond 10,000 may need pagination

---

## Error Recovery and Resilience

### EC-33: User Navigates to Item Just Deleted

**Scenario**: User in Tab A deletes item, then Tab B tries to view it

**Input**: GET /items/5 after item deleted

**Expected Behavior**:
- API returns 404 Not Found
- Frontend redirects to inventory list
- Clear message: "Item not found"

**Implementation Notes**:
- Handle 404 consistently across app
- No error page or crash

### EC-34: Rapid Add-Edit-Delete Sequence

**Scenario**: User quickly adds, edits, deletes same item

**Input**: POST then PATCH then DELETE for id 1

**Expected Behavior**:
- Each operation completes successfully
- Final state: item deleted
- No data corruption
- Frontend UI reflects final state

**Implementation Notes**:
- Operations are atomic
- Sequential processing works correctly

### EC-35: Out of Memory on Frontend

**Scenario**: Frontend memory exhaustion with large items list

**Input**: GET /items with thousands of items, each with long description

**Expected Behavior**:
- Browser may become slow or unresponsive
- Frontend cannot prevent memory issues (browser limit)
- Not an application bug, hardware/browser limit

**Implementation Notes**:
- For local app with reasonable data, not a concern
- Could implement pagination/lazy loading if needed

---

## Summary Table

| EC ID | Category | Severity | Mitigation |
|-------|----------|----------|-----------|
| EC-1 to EC-12 | Input Data | Medium | Validation (frontend + backend) |
| EC-13 to EC-15 | Quantity | Medium | Type validation, limits |
| EC-16 to EC-20 | API/DB | High | Error handling, timeouts, fallbacks |
| EC-21 to EC-23 | Data Integrity | Low | Acceptable for local app |
| EC-24 to EC-28 | Navigation | Low | Safe error messages |
| EC-29 to EC-32 | Display | Low | CSS styling, responsive design |
| EC-33 to EC-35 | Resilience | Low | 404 handling, state management |

All edge cases are acceptable as-is for a local development inventory system. More complex features (pagination, conflict resolution, real-time sync) can be added if needed.
