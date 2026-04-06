# Acceptance Criteria

## Overview
This document defines acceptance criteria for all major features using the Given/When/Then (Gherkin) format. These criteria define when a feature is considered complete and working correctly.

---

## Feature 1: Add New Inventory Item

### AC-1.1: Successfully Add Item with Valid Data

**Given** the user is on the add-item page
**And** the form is empty and ready for input
**When** the user enters:
  - Name: "Laptop"
  - Quantity: 5
  - Category: "Electronics"
  - Description: "Dell XPS 13"
**And** clicks the "Add Item" button
**Then** the system should:
  - Send a POST request to `/items`
  - Receive a 201 Created response with the new item
  - Display a success message
  - Redirect to the inventory list page
  - Show the new item in the list with all entered data

### AC-1.2: Add Item Validation Error - Missing Name

**Given** the user is on the add-item page
**When** the user leaves the "Name" field empty
**And** enters valid data in other fields
**And** clicks "Add Item"
**Then** the system should:
  - Display a client-side validation message: "Name is required"
  - NOT send the request to the backend
  - Keep the user on the add-item page
  - Preserve the data entered in other fields

### AC-1.3: Add Item Validation Error - Negative Quantity

**Given** the user is on the add-item page
**When** the user enters "-5" in the Quantity field
**And** clicks "Add Item"
**Then** the system should:
  - Display a client-side validation message: "Quantity must be non-negative"
  - NOT send the request to the backend
  - Keep the user on the add-item page

### AC-1.4: Add Item Server Error - Empty Category

**Given** the user is on the add-item page
**When** the user enters all data correctly
**But** leaves the Category field empty
**And** clicks "Add Item"
**Then** the system should:
  - Attempt to send POST request (frontend validation may skip)
  - Receive 400 Bad Request from backend
  - Display error message: "Category is required"
  - Keep the user on the add-item page

### AC-1.5: Add Item With Zero Quantity

**Given** the user is on the add-item page
**When** the user enters "0" for quantity
**And** all other fields are valid
**And** clicks "Add Item"
**Then** the system should:
  - Accept the item with quantity 0 (out of stock is valid)
  - Display success message
  - Show item in inventory with quantity 0

---

## Feature 2: View All Inventory Items

### AC-2.1: Display All Items in Table

**Given** the user navigates to the inventory list page
**And** the database contains 3 items:
  - Item 1: Laptop, qty 5
  - Item 2: Mouse, qty 50
  - Item 3: Keyboard, qty 20
**When** the page loads
**Then** the system should:
  - Fetch items using GET `/items`
  - Display all 3 items in an HTML table
  - Show columns: ID, Name, Quantity, Category, Description, CreatedAt
  - Show action buttons: View, Edit, Delete for each item

### AC-2.2: Display Items in Creation Order

**Given** the inventory contains multiple items
**When** the user views the inventory list
**Then** the system should:
  - Display items ordered by creation time (oldest first)
  - Most recently added items appear at the bottom

### AC-2.3: Handle Empty Inventory

**Given** the database is empty (no items exist)
**When** the user opens the inventory list page
**Then** the system should:
  - Fetch using GET `/items`
  - Receive an empty array `[]`
  - Display message: "No items in inventory" or similar
  - NOT display a table
  - Show "Add Item" button or link

### AC-2.4: Display CreatedAt in Human-Readable Format

**Given** the inventory list is displayed
**And** items have createdAt timestamps
**When** the user views the list
**Then** the system should:
  - Convert timestamps from ISO8601 (e.g., "2026-04-06T10:30:00Z")
  - Display in human-readable format like "April 6, 2026 10:30 AM" or "4/6/2026"
  - All timestamps formatted consistently

### AC-2.5: Handle API Error on Load

**Given** the inventory list page is loading
**When** the backend API is unavailable
**Then** the system should:
  - Attempt to use GET `/items`
  - Fail to receive response
  - Display error message: "Unable to load inventory. Please try again."
  - Show "Retry" button
  - NOT display partial or corrupted data

---

## Feature 3: View Item Details

### AC-3.1: Navigate to Item Details

**Given** the user is viewing the inventory list
**When** the user clicks "View" or the item name
**And** the database contains an item with id 2
**Then** the system should:
  - Fetch item using GET `/items/2`
  - Load the edit-item page OR display a details modal
  - Show all item fields:
    - ID: 2
    - Name: Mouse
    - Quantity: 50
    - Category: Accessories
    - Description: Wireless Mouse
    - CreatedAt: (formatted date)

### AC-3.2: Display Item Details Correctly

**Given** the details page is loaded for a valid item
**When** the page renders
**Then** the system should:
  - Display all fields in a readable format
  - Show field labels clearly
  - Mark any fields as read-only (ID and CreatedAt)
  - Provide button to "Edit" or "Back to List"

### AC-3.3: Handle Non-Existent Item

**Given** the user navigates to `/items/999` (non-existent ID)
**When** the page loads
**Then** the system should:
  - Fetch using GET `/items/999`
  - Receive 404 Not Found
  - Display error message: "Item not found"
  - Provide link back to inventory list

### AC-3.4: Handle Item ID Not Editable

**Given** the user is viewing item details
**When** the page loads
**Then** the system should:
  - Display the ID field
  - Make ID field read-only (no edit input)
  - Make CreatedAt field read-only
  - Allow editing only: Name, Quantity, Category, Description

---

## Feature 4: Update Item

### AC-4.1: Successfully Update Item Quantity

**Given** the user is on the edit page for item id 1
**And** current quantity is 5
**When** the user changes quantity to 10
**And** clicks "Save" or "Update"
**Then** the system should:
  - Send PATCH request to `/items/1`
  - Include payload: `{ "quantity": 10 }`
  - Receive 200 OK with updated item
  - Display success message: "Item updated successfully"
  - Redirect to inventory list
  - Show item with new quantity 10

### AC-4.2: Update Multiple Fields

**Given** the user is editing item id 2
**When** the user updates:
  - Name: "Wireless Mouse" (from "Mouse")
  - Quantity: 40 (from 50)
  - Description: "Premium Wireless Mouse" (from "Wireless Mouse")
**And** clicks "Save"
**Then** the system should:
  - Send PATCH with all changed fields
  - Receive 200 OK with all updates applied
  - Return item with ID and CreatedAt unchanged
  - Redirect to list showing updated values

### AC-4.3: Update Only Some Fields

**Given** the user is editing an item
**When** the user modifies only the Description field
**And** leaves other fields unchanged
**And** clicks "Save"
**Then** the system should:
  - Send PATCH with only Description field
  - Preserve Name, Quantity, Category from before
  - Return complete item with all fields
  - Show success message

### AC-4.4: Prevent Invalid Quantity Update

**Given** the user is updating an item
**When** the user enters "-5" for quantity
**And** clicks "Save"
**Then** the system should:
  - Display validation error: "Quantity must be non-negative"
  - NOT send PATCH request
  - Keep user on edit page with data preserved

### AC-4.5: Handle Update of Non-Existent Item

**Given** the user attempts to update item id 999
**When** the system sends PATCH `/items/999`
**Then** the system should:
  - Receive 404 Not Found response
  - Display error message: "Item not found"
  - Offer to go back to inventory list

### AC-4.6: Preserve CreatedAt on Update

**Given** an item with createdAt: "2026-04-01T10:00:00Z"
**When** the user updates the item on "2026-04-06"
**Then** the system should:
  - Return item with createdAt unchanged: "2026-04-01T10:00:00Z"
  - NOT update createdAt to current date
  - Preserve original creation timestamp

### AC-4.7: Preserve ID on Update

**Given** an item with id: 5
**When** the user updates the item
**Then** the system should:
  - Return updated item with id: 5 (unchanged)
  - NOT generate new ID or allow ID modification
  - Maintain referential integrity

---

## Feature 5: Delete Item

### AC-5.1: Successfully Delete Item

**Given** the user is viewing the inventory list
**And** the item with id 3 is visible
**When** the user clicks "Delete" button for that item
**And** confirms the deletion (if confirmation dialog shown)
**Then** the system should:
  - Send DELETE request to `/items/3`
  - Receive 200 OK response
  - Item no longer appears in the list
  - Display success message: "Item deleted successfully"
  - Update list view immediately

### AC-5.2: Delete Confirmation Prompt

**Given** the user clicks "Delete" on an item
**When** a confirmation dialog appears
**And** the dialog says "Are you sure you want to delete this item?"
**And** the user clicks "Confirm"
**Then** the system should:
  - Send DELETE request to `/items/{id}`
  - Proceed with deletion

### AC-5.3: Cancel Deletion

**Given** a delete confirmation dialog is open
**When** the user clicks "Cancel" or closes the dialog
**Then** the system should:
  - NOT send DELETE request
  - Keep item in inventory
  - Close the dialog
  - Return to inventory list view

### AC-5.4: Permanent Deletion

**Given** an item with id 5 is deleted
**When** the user tries to view that item using GET `/items/5`
**Then** the system should:
  - Receive 404 Not Found
  - Item is permanently removed (not recoverable)

### AC-5.5: Handle Delete of Non-Existent Item

**Given** the user attempts to delete item id 999
**When** the system sends DELETE request
**Then** the system should:
  - Receive 404 Not Found
  - Display error message: "Item not found or already deleted"
  - Refresh inventory list (in case item was deleted elsewhere)

### AC-5.6: Delete Removes from List Immediately

**Given** the inventory list shows 10 items
**When** the user deletes one item successfully
**Then** the system should:
  - Immediately update the list to show 9 items
  - NOT require page refresh
  - Show success confirmation

---

## Feature 6: Handle Invalid Input

### AC-6.1: Reject Empty Name

**Given** the user is on add-item page
**When** submitting form with empty name
**Then** validation should:
  - Display: "Name is required"
  - Reject submission
  - Not send to backend

### AC-6.2: Reject Non-Numeric Quantity

**Given** the user enters "abc" in quantity field
**When** submitting the form
**Then** validation should:
  - Display: "Quantity must be a number"
  - Reject submission
  - Keep form data for correction

### AC-6.3: Reject Negative Quantity

**Given** the user enters "-10" for quantity
**When** submitting
**Then** validation should:
  - Display: "Quantity cannot be negative"
  - Reject submission

### AC-6.4: Accept Zero Quantity

**Given** the user enters "0" for quantity
**When** submitting
**Then** the system should:
  - Accept submission (out-of-stock is valid)
  - Create/update item with quantity 0

### AC-6.5: Reject Decimal Quantity

**Given** the user enters "5.5" for quantity
**When** submitting
**Then** validation should:
  - Display: "Quantity must be a whole number"
  - Reject submission

---

## Feature 7: Navigate Between Pages

### AC-7.1: Navigate from List to Add

**Given** the user is on inventory list page
**When** the user clicks "Add New Item" button
**Then** the system should:
  - Navigate to add-item.html
  - Display empty form
  - Show form title "Add New Item"

### AC-7.2: Navigate from Add to List

**Given** the user successfully adds an item
**When** API returns 201 Created
**Then** the system should:
  - Automatically redirect to inventory list
  - Display success message
  - Show newly created item in list

### AC-7.3: Navigate from List to Edit

**Given** the user is on inventory list
**And** there is an item with id 2
**When** the user clicks "Edit" button
**Then** the system should:
  - Navigate to edit-item.html with item id 2
  - Load current item data into form
  - Show form title "Edit Item"

### AC-7.4: Navigate from Edit to List

**Given** the user is on edit-item page
**When** the user successfully updates an item
**Then** the system should:
  - Redirect to inventory list
  - Display success message
  - Show updated item in list

### AC-7.5: Load Item Form with Pre-filled Data

**Given** the user navigates to edit-item page for id 2
**When** the page loads
**Then** the form should:
  - Show current name: "Mouse"
  - Show current quantity: 50
  - Show current category: "Accessories"
  - Show current description: "Wireless Mouse"
  - Disable/show as read-only: id and createdAt fields

### AC-7.6: Back Button Navigation

**Given** the user is on add-item or edit-item page
**When** the user clicks "Back" or "Cancel"
**Then** the system should:
  - Return to inventory list page
  - NOT save any changes
  - NOT show validation errors for incomplete forms

---

## Feature 8: Handle Missing Item IDs

### AC-8.1: Invalid ID Format

**Given** the user navigates to `/items/abc`
**When** the page attempts to load
**Then** the system should:
  - Treat "abc" as invalid ID
  - Receive 404 from backend OR show error immediately
  - Display: "Invalid item ID"

### AC-8.2: Non-Integer ID

**Given** the user navigates to `/items/5.5`
**When** the page loads
**Then** the system should:
  - Treat as invalid ID
  - Show error message: "Item not found"
  - Provide link back to list

### AC-8.3: Missing ID Parameter

**Given** the user navigates to `edit-item.html` without ID
**When** the page loads
**Then** the system should:
  - Detect missing ID
  - Display error: "No item ID specified"
  - Provide option to go back to list

### AC-8.4: Edit Non-Existent Item

**Given** the user navigates to `edit-item.html?id=999`
**When** the page attempts to fetch the item
**Then** the system should:
  - Send GET `/items/999`
  - Receive 404
  - Display: "Item not found"
  - Offer to return to inventory list

---

## Summary Table

| Feature | Criteria ID | Status |
|---------|------------|--------|
| Add Item | AC-1.1 to AC-1.5 | Must Pass |
| View All Items | AC-2.1 to AC-2.5 | Must Pass |
| View Item Details | AC-3.1 to AC-3.4 | Must Pass |
| Update Item | AC-4.1 to AC-4.7 | Must Pass |
| Delete Item | AC-5.1 to AC-5.6 | Must Pass |
| Handle Invalid Input | AC-6.1 to AC-6.5 | Must Pass |
| Navigate Pages | AC-7.1 to AC-7.6 | Must Pass |
| Handle Missing IDs | AC-8.1 to AC-8.4 | Must Pass |

All acceptance criteria must pass for the feature to be considered complete.
