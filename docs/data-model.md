# QuickNotes Data Model

## 1. Overview

QuickNotes uses a relational database to store user accounts, notes, tags, and the relationships between notes and tags.

The database has four entities:

- `users`: Stores registered user information.
- `notes`: Stores notes created by users.
- `tags`: Stores reusable labels for organizing notes.
- `note_tags`: Connects notes with their assigned tags.

## 2. Entities and Columns

### Users Table

The `users` table stores information about registered users.

| Column | Data Type | Constraints |
|---|---|---|
| `id` | INTEGER | Primary key |
| `name` | TEXT | NOT NULL |
| `email` | TEXT | NOT NULL, UNIQUE |
| `created_at` | TEXT | NOT NULL, defaults to current timestamp |

### Notes Table

The `notes` table stores notes created by users.

| Column | Data Type | Constraints |
|---|---|---|
| `id` | INTEGER | Primary key |
| `user_id` | INTEGER | NOT NULL, foreign key referencing `users.id` |
| `title` | TEXT | NOT NULL, maximum 100 characters |
| `body` | TEXT | Optional |
| `created_at` | TEXT | NOT NULL, defaults to current timestamp |
| `updated_at` | TEXT | NOT NULL, defaults to current timestamp |

The `user_id` column identifies the owner of each note.

### Tags Table

The `tags` table stores labels that can be reused across different notes.

| Column | Data Type | Constraints |
|---|---|---|
| `id` | INTEGER | Primary key |
| `name` | TEXT | NOT NULL, UNIQUE |

The unique tag name prevents duplicate copies of the same tag.

### Note_Tags Table

The `note_tags` table links notes to tags.

| Column | Data Type | Constraints |
|---|---|---|
| `note_id` | INTEGER | Primary key component, foreign key referencing `notes.id` |
| `tag_id` | INTEGER | Primary key component, foreign key referencing `tags.id` |

Together, `note_id` and `tag_id` form a composite primary key. This prevents the same tag from being attached to the same note more than once.

## 3. Relationships

### Users and Notes: One-to-Many

One user can create many notes, but each note belongs to one user. The `notes.user_id` foreign key references `users.id`.

### Notes and Tags: Many-to-Many

A note can have multiple tags, and a tag can be associated with multiple notes.

The `note_tags` join table connects `notes` and `tags`. It records each note-tag combination and allows the database to represent this many-to-many relationship without storing lists of tags inside individual note records.

## 4. CREATE TABLE Statements

The following SQL statements create all four tables in SQLite.

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL CHECK (length(title) <= 100),
    body TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id)
        ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id)
        ON DELETE CASCADE
);
```

The primary keys identify records uniquely, while the foreign keys maintain relationships between tables. The `ON DELETE CASCADE` rules automatically remove a user's notes or a note's tag links when their parent records are deleted.

## 5. Example SQL Queries

### Query 1: Get All Notes Belonging to a User

```sql
SELECT
    notes.id,
    notes.title,
    notes.body,
    users.name AS owner
FROM notes
JOIN users ON notes.user_id = users.id
WHERE users.email = 'alice@example.com';
```

This query uses a `JOIN` to retrieve the notes owned by a specific user.

### Query 2: Get All Tags Assigned to a Note

```sql
SELECT
    notes.title,
    tags.name AS tag_name
FROM notes
JOIN note_tags ON notes.id = note_tags.note_id
JOIN tags ON note_tags.tag_id = tags.id
WHERE notes.id = 1;
```

This query joins all three tables to list the tags associated with a particular note.

### Query 3: Count Notes Per User

```sql
SELECT
    users.name,
    COUNT(notes.id) AS total_notes
FROM users
LEFT JOIN notes ON users.id = notes.user_id
GROUP BY users.id, users.name;
```

The `LEFT JOIN` includes users who have no notes; their total will be zero.

### Query 4: Find All Notes with a Specific Tag

```sql
SELECT
    notes.id,
    notes.title,
    notes.body
FROM notes
JOIN note_tags ON notes.id = note_tags.note_id
JOIN tags ON note_tags.tag_id = tags.id
WHERE tags.name = 'work';
```

This query finds all notes associated with the `work` tag.

## 6. Index

I would create an index on `notes(user_id)`:

```sql
CREATE INDEX idx_notes_user_id ON notes(user_id);
```

This index can speed up queries that retrieve notes belonging to a particular user. It becomes more useful as the number of users and notes increases.

The composite primary key on `note_tags(note_id, tag_id)` also creates an index that supports lookups by note ID and prevents duplicate note-tag combinations.

## 7. SQL or NoSQL?

I would choose SQL for QuickNotes because the application contains structured data with clear relationships between users, notes, and tags. A relational database supports primary keys, foreign keys, unique constraints, and JOIN operations, helping maintain data accuracy and consistency. SQL also makes it straightforward to retrieve a user's notes, count notes, and filter notes by tag. These requirements make a relational SQL database a suitable choice for QuickNotes.
