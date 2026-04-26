## Image Upload Feature

### Overview
The inventory system will allow users to attach an image when adding a new item. The image helps visually identify the item in the inventory list.

### Add Item with Image
When creating a new inventory item, users have the option to upload an image file.

New form field:
- image (optional)

Supported formats:
- JPG
- PNG
- JPEG

If no image is uploaded, the system will store the item without an image.

### Item Display
When viewing inventory items, the system will display the uploaded image together with the item information.

Displayed fields:
- item name
- quantity
- category
- description
- image

### Database Update

Item table new field:

- imageUrl (string)

This field stores the file path or URL of the uploaded image.

### API Changes

POST /items  
Create item with optional image upload.

GET /items  
Return item list including imageUrl.

GET /items/:id  
Return item details including imageUrl.

### Backend Behavior
- Save uploaded images in a server folder (example: `/uploads`)
- Store the image file path in the database
- Return the image path when fetching items

### Frontend Changes
Add an image upload input in the add item form.

Example field:
<input type="file" name="image" accept="image/*">