# QuickNotes System Design

## Project Description

QuickNotes is a note-taking application project designed to demonstrate how a browser-based client communicates with an API and how a real online note-taking service can be designed to support one million registered users.

The front end uses HTML, CSS, and JavaScript to load notes, create new notes, and delete notes through the JSONPlaceholder practice API. The accompanying design documents describe the REST API, database structure, and scalable system architecture that a backend team could implement.

## Features

- Load up to 10 notes from the API.
- Create notes using POST requests.
- Delete notes using DELETE requests.
- Validate note titles and limit them to 100 characters.
- Display loading, success, empty, and error states.
- Disable relevant buttons while requests are running.
- Document the REST API, data model, and system architecture.

## Technologies Used

- HTML5
- CSS3
- JavaScript (Fetch API, async/await, and JSON)
- JSONPlaceholder practice API
- SQL and relational database design
- Git and GitHub

## How to Run the API Client

1. Clone the repository:

   ```bash
   git clone https://github.com/OkeshED/quicknotes-system-design.git
   ```

2. Enter the project folder:

   ```bash
   cd quicknotes-system-design
   ```

3. Open the folder in Visual Studio Code:

   ```bash
   code .
   ```

4. Open `index.html` using the VS Code Live Server extension, or open the HTML file directly in a browser.

5. Click **Load Notes** to retrieve notes from JSONPlaceholder.

6. Use the form to create a note and the Delete buttons to remove notes from the current page.

The application requires an internet connection to communicate with JSONPlaceholder.

**Note:** JSONPlaceholder is a practice API. It simulates creating and deleting posts but does not permanently store these changes. Created and deleted notes are reflected in the current page's local state.

## System Design Documents

- [API Design](docs/api-design.md) — REST endpoints, request and response examples, and error status codes.
- [Data Model](docs/data-model.md) — Database entities, relationships, SQL statements, example queries, and indexing.
- [Architecture](docs/architecture.md) — Functional and non-functional requirements, capacity estimates, architecture diagram, request flows, trade-offs, and availability strategy.

## What I Learned

1. **API integration:** How to use `fetch`, async/await, and reusable request functions to communicate with a REST API, handle HTTP errors, and process JSON responses.

2. **CRUD operations:** How GET, POST, and DELETE requests support reading, creating, and deleting resources, as well as how client-side state can reflect changes when using a practice API.

3. **Database design:** How primary keys, foreign keys, constraints, joins, and a join table represent relationships between users, notes, and tags.

4. **System scalability:** How load balancers, application servers, caching, read replicas, queues, and background workers help a service handle growing traffic.

5. **Git and GitHub:** How to track project changes with meaningful commits, push work to a remote repository, and maintain a clear development history.

## Repository

[https://github.com/OkeshED/quicknotes-system-design](https://github.com/OkeshED/quicknotes-system-design)
