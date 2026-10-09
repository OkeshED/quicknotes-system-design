# QuickNotes API Design

## Overview

The QuickNotes API is a RESTful API for creating, reading, updating, and deleting notes. Users can also retrieve notes belonging to a specific user.

## API Endpoints

### 1. List Notes

- **Method:** GET
- **Path:** `/api/v1/notes`
- **Description:** Returns a paginated list of notes available to the authenticated user.
- **Success Status:** `200 OK`

### 2. Get One Note

- **Method:** GET
- **Path:** `/api/v1/notes/{id}`
- **Description:** Returns the details of one note using its ID.
- **Success Status:** `200 OK`

### 3. Create a Note

- **Method:** POST
- **Path:** `/api/v1/notes`
- **Description:** Creates a new note for the authenticated user.
- **Example Request Body:**

```json
{
  "title": "Meeting Notes",
  "body": "Discuss project milestones and deadlines."
}
```

- **Success Status:** `201 Created`

### 4. Update a Note

- **Method:** PUT
- **Path:** `/api/v1/notes/{id}`
- **Description:** Updates the title and body of an existing note identified by its ID.
- **Example Request Body:**

```json
{
  "title": "Updated Meeting Notes",
  "body": "Review project progress and deadlines."
}
```

- **Success Status:** `200 OK`

**Example Request:**

`PUT /api/v1/notes/101`

The request updates the title and body of note 101. The server saves
the changes and returns the updated note with status `200 OK`.
The request body contains the updated title and body of note `101`. The server saves the changes and returns the updated note with status `200 OK`.

### 5. Delete a Note

- **Method:** DELETE
- **Path:** `/api/v1/notes/{id}`
- **Description:** Deletes an existing note belonging to the authenticated user.
- **Success Status:** `204 No Content`

### 6. List Notes by Tag

- **Method:** GET
- **Path:** `/api/v1/notes?tag=work`
- **Description:** Returns notes associated with the specified tag.
- **Success Status:** `200 OK`

### 7. List Notes by User

- **Method:** GET
- **Path:** `/api/v1/users/{userId}/notes`
- **Description:** Returns the notes belonging to a specified user, subject to authorization.
- **Success Status:** `200 OK`

### 8. Search Notes

- **Method:** GET
- **Path:** `/api/v1/notes?search=meeting`
- **Description:** Searches the authenticated user's notes using the supplied search text.
- **Success Status:** `200 OK`

## Create Note Request and Response

### Request

**Method:** `POST`

**Path:** `/api/v1/notes`

```json
{
  "title": "Shopping List",
  "body": "Milk, bread and vegetables"
}
```

### Response

**Status:** `201 Created`

```json
{
  "id": 101,
  "userId": 1,
  "title": "Shopping List",
  "body": "Milk, bread and vegetables",
  "createdAt": "2026-10-09T08:00:00Z",
  "updatedAt": "2026-10-09T08:00:00Z"
}
```

## List Notes Request and Response

### Request

**Method:** `GET`

**Path:** `/api/v1/notes?limit=10&page=1`

### Response

**Status:** `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "Meeting Notes",
      "body": "Discuss project milestones.",
      "createdAt": "2026-10-09T07:00:00Z",
      "updatedAt": "2026-10-09T07:00:00Z"
    },
    {
      "id": 2,
      "userId": 1,
      "title": "Shopping List",
      "body": "Milk and bread.",
      "createdAt": "2026-10-09T08:00:00Z",
      "updatedAt": "2026-10-09T08:00:00Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 2
}
```

## Error Status Codes

The QuickNotes API returns appropriate HTTP status codes when a request cannot be completed.

### 400 Bad Request

The request contains invalid or missing information, such as a missing title.

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Title is required."
  }
}
```

### 401 Unauthorized

The request does not contain valid authentication credentials.

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required."
  }
}
```

### 403 Forbidden

The authenticated user does not have permission to access the requested resource.

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this note."
  }
}
```

### 404 Not Found

The requested note or other resource does not exist.

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Note not found."
  }
}
```

### 500 Internal Server Error

An unexpected server-side error prevents the request from completing.

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected server error occurred."
  }
}
```

## API Design Principles

The QuickNotes API follows REST principles and uses standard HTTP methods and status codes. Request and response bodies use JSON. Authentication protects user data, and pagination allows clients to retrieve notes in manageable batches. Users may only access or modify notes they are authorized to use.
