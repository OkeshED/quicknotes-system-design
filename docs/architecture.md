# QuickNotes System Architecture

## 1. Overview

QuickNotes is a note-taking application that allows users to create, view, update, delete, search, and organize their notes. The system is designed to grow from a small application into an online service supporting one million registered users.

The architecture uses multiple application servers, caching, a relational database with a read replica, a content delivery network (CDN), and a message queue for background processing.

## 2. Functional Requirements

The system must:

1. Allow users to register and authenticate securely.
2. Allow authenticated users to create, view, update, and delete their own notes.
3. Allow users to organize notes using tags and search for notes.
4. Return notes in paginated lists to avoid sending too much data in one request.
5. Store note information reliably and prevent unauthorized access to another user's notes.
6. Process background tasks, such as search indexing and notifications, without unnecessarily delaying API responses.

## 3. Non-Functional Requirements

### Scalability

The application must handle increasing numbers of users and requests by allowing application servers, workers, and other services to scale horizontally.

### Availability

The application should remain available when an individual application server or worker fails.

### Performance

Frequently requested data should be served quickly using caching and database read replicas. The target for common API requests is a response time of less than 300 milliseconds under normal load, subject to testing and capacity.

### Security

The system must use HTTPS, authenticate users, authorize access to individual notes, validate input, and protect sensitive information.

### Reliability and Data Integrity

The database must enforce relationships and constraints. Backups, monitoring, replication, and recovery procedures must protect against failures and data loss.

### Maintainability

The application should use clear service boundaries, monitoring, logging, and documented APIs so that the engineering team can maintain and improve the system.

## 4. Load Estimates for One Million Users

### Assumptions

The following estimates are planning assumptions, not measured production traffic:

- Total registered users: 1,000,000.
- Daily active users: 10% of registered users.
- Each daily active user makes 20 read requests per day.
- Each daily active user performs 2 write operations per day, including creating or updating notes.
- Each daily active user creates an average of 1 new note per day.
- The average stored note, including its text and basic metadata, occupies 2 KB.
- A day contains 86,400 seconds.
- Peak traffic is estimated at five times average traffic.
- Storage estimates exclude database indexes, backups, replicas, and infrastructure overhead.

### Daily Active Users

1,000,000 × 10% = **100,000 daily active users**.

### Reads Per Second

Daily reads:

100,000 × 20 = 2,000,000 reads per day.

Average reads per second:

2,000,000 ÷ 86,400 = approximately **23.1 reads per second**.

Estimated peak reads per second:

23.1 × 5 = approximately **116 reads per second**.

### Writes Per Second

Daily write operations:

100,000 × 2 = 200,000 writes per day.

Average writes per second:

200,000 ÷ 86,400 = approximately **2.3 writes per second**.

Estimated peak writes per second:

2.3 × 5 = approximately **12 writes per second**.

### Storage Per Year

Assuming each daily active user creates one new note per day:

100,000 × 365 = 36,500,000 new notes per year.

At 2 KB per note:

36,500,000 × 2 KB = 73,000,000 KB.

This is approximately **73 GB of new note data per year**, before indexes, backups, and replicas.

These estimates are averages and planning figures. Actual traffic may be uneven, so monitoring and load testing will be needed to choose production capacity.

## 5. Architecture Diagram

```text
                      ┌─────────────────────┐
                      │  Browser / Mobile   │
                      │       Client        │
                      └──────────┬──────────┘
                                 │
                                 │ DNS lookup
                                 ▼
                      ┌─────────────────────┐
                      │         DNS         │
                      └──────────┬──────────┘
                                 │
                                 ▼
                      ┌─────────────────────┐
                      │         CDN         │
                      │ Static assets/cache │
                      └──────────┬──────────┘
                                 │
                         Dynamic API requests
                                 │
                                 ▼
                      ┌─────────────────────┐
                      │   Load Balancer     │
                      └──────────┬──────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
             ┌──────────────┐          ┌──────────────┐
             │ App Server 1 │          │ App Server 2 │
             └──────┬───────┘          └───────┬──────┘
                    │                          │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
             ┌──────────────┐          ┌────────────────┐
             │    Cache     │          │ Primary Database│
             │  Redis-like  │          └───────┬────────┘
             └──────────────┘                  │
                                               │ Replication
                                               ▼
                                       ┌────────────────┐
                                       │  Read Replica  │
                                       └────────────────┘

             App servers also publish background jobs
                                 │
                                 ▼
                         ┌──────────────┐
                         │    Queue     │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │    Worker    │
                         │ Background   │
                         │  Processing  │
                         └──────────────┘
```

Private, authenticated note responses should not be shared through a public CDN cache. The CDN primarily caches static application assets, while authenticated API requests are forwarded to the application servers with appropriate cache controls.

## 6. Architecture Components and the Problems They Solve

### Client

The browser or mobile client provides the user interface for creating, viewing, updating, deleting, and searching notes.

### DNS

DNS translates the application's domain name into the network address needed to reach the service.

### CDN

The CDN caches static files such as CSS, JavaScript, and images close to users, reducing latency and traffic reaching the application infrastructure.

### Load Balancer

The load balancer distributes incoming API requests across multiple application servers so that one server does not receive all the traffic.

### Application Servers

Multiple application servers handle authentication, authorization, validation, note operations, and communication with the database and other services.

### Cache

The cache stores frequently requested data, such as recent note lists, to reduce repeated database queries and improve response times.

### Primary Database

The primary relational database stores users, notes, tags, and their relationships while enforcing data integrity and accepting writes.

### Read Replica

The read replica serves suitable read-only queries, reducing the primary database's read workload and allowing the system to handle more read traffic.

### Queue

The queue stores background jobs durably so that tasks such as search indexing and notifications do not have to finish before an API request returns.

### Worker

The worker processes queued jobs asynchronously, allowing background work to scale independently of the application servers.

## 7. GET /notes Request Flow

1. The user opens QuickNotes and requests a list of notes.
2. DNS resolves the application's domain name to the service's entry point.
3. The CDN serves eligible cached static assets; the authenticated notes API request is forwarded to the backend.
4. The load balancer sends the API request to an available application server.
5. The application server authenticates the user and verifies that the user is authorized to access the requested notes.
6. The server checks the cache for a valid entry associated with that user and request.
7. If the cache contains valid data, the server returns it. Otherwise, the server retrieves the paginated notes from the read replica.
8. If fresh data is required or the replica is unavailable, the application can read from the primary database according to its consistency and failover policy.
9. The application server returns the notes as a JSON response with an appropriate HTTP status.
10. Where safe, the result is stored in the cache for subsequent requests, using a suitable expiration and invalidation strategy.

## 8. POST /notes Request Flow

1. The user fills in the note form and submits a new note.
2. The client performs basic input validation and sends a POST request containing the note title and body over HTTPS.
3. DNS resolves the service domain, and the request passes through the CDN to the load balancer.
4. The load balancer routes the request to an available application server.
5. The application server authenticates the user, verifies permissions, and validates the input, including the required title and its length.
6. The application server inserts the new note into the primary database, associating it with the authenticated user.
7. The database commits the transaction and generates the note ID and timestamps.
8. The application publishes a background job to the queue for tasks such as search indexing or notifications.
9. A worker processes the queued job independently of the main API request.
10. The application returns a `201 Created` response containing the new note as JSON.
11. Relevant cache entries are invalidated or refreshed so that subsequent reads do not keep returning outdated note lists.

## 9. Trade-Offs

### Caching vs Data Freshness

Caching reduces response times and database load, but cached note lists can become stale after a note is created, updated, or deleted. QuickNotes should use short expiration periods, user-specific cache keys, and cache invalidation after writes.

### Read Replicas vs Consistency

Read replicas increase read capacity, but replication lag can cause users to see slightly older data. Operations that require immediately consistent results can read from the primary database, while less sensitive reads can use the replica.

### Asynchronous Processing vs Immediate Completion

Queues and workers keep API requests responsive, but background tasks may finish after the user receives a success response. The system should provide retry mechanisms, monitoring, and idempotent job processing so that temporary worker failures do not lose work or create duplicate effects.

### High Availability vs Cost

Running multiple application servers, database replicas, redundant infrastructure, and durable queues improves availability but increases infrastructure costs. Capacity should be monitored and scaled according to actual demand.

## 10. Avoiding Single Points of Failure

The application runs at least two application servers behind a load balancer, so one server can fail without taking down the entire service. The load balancer and DNS should use highly available managed infrastructure, while the CDN distributes static content across multiple edge locations.

The primary database should run with a high-availability standby or managed automatic failover, with a read replica for read scaling and recovery. Backups must be tested regularly. A read replica alone does not guarantee automatic database failover, so the deployment must include an explicit failover procedure.

The cache should use a replicated or clustered deployment where appropriate, and the application should be able to fall back to database reads if the cache is unavailable. The queue should use durable replicated storage, and multiple workers should be able to consume jobs. Monitoring, alerts, retries, and recovery procedures help detect failures and restore service.

## 11. Conclusion

QuickNotes can support one million registered users by separating request handling, database reads and writes, caching, and background processing. Multiple application servers, a load balancer, a CDN, caching, database replication, and a durable queue help the system scale and recover from individual component failures. The estimates in this document provide a starting point and should be validated with load testing and production monitoring.
