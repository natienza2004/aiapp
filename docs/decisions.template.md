# Design and Implementation Decisions

## Overview
This document explains key architectural and design decisions made for the Simple Inventory System. Each decision includes rationale, alternatives considered, and tradeoffs.

---

## Technology Stack Decisions

### Decision 1: NestJS for Backend

**Decision**: Use NestJS as the backend framework

**Rationale**:
- Built on TypeScript, providing type safety from day one
- Opinionated structure (modules, controllers, services) perfect for learners
- Excellent for REST API development with minimal boilerplate
- Active ecosystem and community support
- Dependency injection pattern promotes testable code
- Decorator-based approach is intuitive for routing and validation

**Alternatives Considered**:
1. **Express.js** - More minimal, but requires more boilerplate and structure decisions
2. **Fastify** - Good for performance, but steeper learning curve for beginners
3. **Django/Flask** - Python based, outside TypeScript ecosystem
4. **Spring Boot** - Java heavy, not aligned with Node.js frontend choice

**Tradeoffs**:
- Larger framework than Express, but saves development time
- More opinionated structure may feel restrictive initially
- Faster learning curve due to conventions

**Status**: ✅ Approved - Excellent fit for project goals

---

### Decision 2: TypeScript for Both Frontend and Backend

**Decision**: Use TypeScript for both backend and frontend code

**Rationale**:
- Type safety reduces bugs in both environments
- Single language ecosystem (JavaScript/TypeScript)
- Frontend and backend teams can share patterns and conventions
- Developer experience improved with IDE autocomplete
- Catches errors at compile-time rather than runtime
- Educational value for learning type systems

**Alternatives Considered**:
1. **JavaScript on Frontend, TypeScript on Backend** - Inconsistent DX
2. **JavaScript everywhere** - Loses type safety benefits
3. **Other typed languages** - Breaks single-language consistency

**Tradeoffs**:
- Build step required (TypeScript compilation)
- Small learning curve for JavaScript developers new to types
- Type definitions needed for untyped libraries

**Status**: ✅ Approved - Provides consistency and safety

---

### Decision 3: TypeORM as ORM

**Decision**: Use TypeORM for database operations instead of raw SQL or other ORMs

**Rationale**:
- Built for TypeScript, excellent type integration
- Entity class definitions are self-documenting
- Supports MySQL natively with no additional drivers
- `synchronize: true` provides auto-migration for development
- Query builder is expressive and type-safe
- Decorator-based column definitions match NestJS style
- Repository pattern promotes testability

**Alternatives Considered**:
1. **Raw MySQL queries** - SQL injection risk, tedious data mapping
2. **Sequelize** - More Node.js focused, less TypeScript optimized
3. **Mongoose** - Designed for MongoDB, not MySQL
4. **Knex.js** - Query builder only, not a full ORM

**Tradeoffs**:
- Another layer of abstraction to understand
- Performance overhead minimal for local app
- Debugging sometimes requires understanding ORM internals

**Status**: ✅ Approved - Future-proofs data layer

---

### Decision 4: MySQL Database

**Decision**: Use MySQL for persistent storage, compatible with WAMP stack

**Rationale**:
- WAMP is ubiquitous for Windows local development
- MySQL is industry-standard, reliable, and battle-tested
- WAMP MySQL comes pre-configured and ready to use
- Fits target user environment (Windows developer)
- No complex setup required
- Compatible with TypeORM and NestJS
- Excellent for relational data like inventory items

**Alternatives Considered**:
1. **PostgreSQL** - More advanced, but not in standard WAMP
2. **SQLite** - File-based, simpler setup, smaller footprint
3. **MongoDB** - NoSQL, overkill for structured inventory data
4. **In-memory database** - No persistence between restarts

**Tradeoffs**:
- Requires WAMP installation and MySQL running
- Client must configure database connection
- Schema synchronization requires `synchronize: true` (not for production)

**Status**: ✅ Approved - Matches target environment (WAMP)

---

### Decision 5: Vanilla TypeScript Frontend (No Framework)

**Decision**: Use plain HTML, CSS, and TypeScript without frontend framework (React, Vue, Angular)

**Rationale**:
- Minimal dependencies and setup
- Easier for beginners to understand (fewer abstractions)
- Smaller bundle size
- Fast development without build complexity
- Shows core JavaScript/TypeScript patterns clearly
- Demonstrates how APIs work at the fundamental level
- Perfect for educational purposes
- No JSX or virtual DOM overhead

**Alternatives Considered**:
1. **React** - Complex ecosystem, JSX learning curve, larger bundle
2. **Vue** - Good, but adds templating layer
3. **Angular** - Heavyweight for simple project
4. **Svelte** - Smaller bundle, but less mainstream knowledge

**Tradeoffs**:
- Manual DOM manipulation (not scalable to complex UIs)
- No component abstraction
- Manual state management
- Not suitable for large applications
- Less familiar to modern web developers

**Status**: ✅ Approved - Appropriate for beginner-friendly scope

---

### Decision 6: Fetch API for HTTP Requests

**Decision**: Use native Fetch API instead of axios or other HTTP libraries

**Rationale**:
- Native browser API, no dependencies required
- Built-in to all modern browsers
- Learning the standard API vs. library increases portability
- Simpler debugging (no hidden request interceptors)
- Async/await support with modern syntax
- Adequate for project scope

**Alternatives Considered**:
1. **axios** - Good library, but adds dependency
2. **jQuery** - Legacy, not recommended
3. **XMLHttpRequest** - Older API, harder to use
4. **GraphQL client** - Overkill for REST API

**Tradeoffs**:
- No built-in request interceptors
- Error handling more verbose
- No automatic JSON transformation (must call `.json()`)

**Status**: ✅ Approved - Standard and appropriate

---

## Architecture Decisions

### Decision 7: REST API Architecture

**Decision**: Use REST (Representational State Transfer) API architecture

**Rationale**:
- Standard web API pattern, highly familiar
- HTTP verbs map cleanly to CRUD operations
- Stateless requests simplify backend
- Easy to understand and debug
- Plays well with HTTP caching and proxies
- Perfect learning model for API fundamentals

**Alternatives Considered**:
1. **GraphQL** - Powerful, but steeper learning curve
2. **RPC/Procedure Calls** - Less standardized
3. **WebSockets** - For real-time, unnecessary for local app
4. **gRPC** - Complex for simple project

**Tradeoffs**:
- Multiple requests for related data (no single query)
- Over-fetching of data possible
- No built-in versioning
- Fixed endpoints vs. flexible GraphQL queries

**Status**: ✅ Approved - Clear and understandable

---

### Decision 8: CORS Enabled in Backend

**Decision**: Enable CORS for all origins on backend

**Rationale**:
- Local development environment, security less critical than convenience
- Allows frontend (file:// or http://localhost port) to call backend
- Simplifies development workflow
- No authentication/authorization layers needed

**Alternatives Considered**:
1. **Strict CORS** - Whitelist only frontend origin
2. **Same-origin only** - No cross-origin requests allowed
3. **Credentials-based CORS** - Adds security but complexity

**Tradeoffs**:
- Open to any origin (security risk in production)
- Not suitable for public deployment
- Requires closure in main.ts for production use

**Status**: ✅ Approved - Acceptable for local development

**⚠️ Production Note**: Must be restricted before deployment

---

### Decision 9: No Authentication/Authorization

**Decision**: Skip user authentication and authorization

**Rationale**:
- Local development environment, single user assumed
- Simplifies architecture and reduces scope
- Faster development and deployment
- API endpoints are directly accessible
- All users have full access (no roles/permissions)
- Meets beginner-learning objectives
- Reduces complexity for WAMP environment

**Alternatives Considered**:
1. **JWT Authentication** - Adds complexity, requires tokens
2. **Session-based Auth** - Stateful, session management overhead
3. **Role-based Access Control** - Unnecessary for single user
4. **OAuth** - Enterprise-level, overkill

**Tradeoffs**:
- No multi-user support
- No audit trail of who made changes
- Cannot be deployed securely to production
- No permission boundaries

**Status**: ✅ Approved - Appropriate for local development

**🔒 Security Note**: Must add auth before multi-user/production use

---

### Decision 10: No API Versioning

**Decision**: Use unversioned API endpoints (no /v1/ prefix)

**Rationale**:
- Single version of API deployed locally
- No need for backward compatibility management
- Simplifies URL structure
- Easy URL construction on frontend
- No switching between multiple API versions

**Alternatives Considered**:
1. **URL Versioning** - `/api/v1/items` - Future-proof but unnecessary
2. **Header Versioning** - Via Accept header - Adds complexity
3. **Content Negotiation** - Overkill for local app

**Tradeoffs**:
- Cannot run multiple API versions simultaneously
- Any API change breaks existing clients
- Not scalable to production with legacy support

**Status**: ✅ Approved - Acceptable for local, single-version app

---

## Data Modeling Decisions

### Decision 11: Hard Delete (No Soft Delete)

**Decision**: Permanently delete items from database (hard delete)

**Rationale**:
- Simplifies data model (no "deleted_at" field)
- Easier to understand for beginners
- Space efficient (deleted items don't consume DB space)
- Meets scope (no undelete requirement)
- Appropriate for local learning app

**Alternatives Considered**:
1. **Soft Delete** - Mark with deleted_at, hide in queries
2. **Archive Table** - Move deleted items to separate table
3. **Versioning** - Keep history of all changes

**Tradeoffs**:
- Permanent data loss (no recovery from accidental delete)
- No audit trail of deletions
- Cannot restore deleted items
- Loss of historical data

**Status**: ✅ Approved - Acceptable for local app

**⚠️ Note**: Could add soft delete in future for audit compliance

---

### Decision 12: Auto-Increment ID Generation

**Decision**: Let database auto-generate item IDs as auto-increment primary keys

**Rationale**:
- Simple, database-native approach
- IDs guaranteed unique
- No client-side ID generation logic
- Sequential IDs provide visual ordering
- Standard industry practice
- Easy to understand

**Alternatives Considered**:
1. **UUID** - Globally unique, but longer strings
2. **Client-generated IDs** - Complex sync logic needed
3. **Composite Keys** - Unnecessary complexity
4. **No IDs** - Identification by name (ambiguous)

**Tradeoffs**:
- IDs are predictable (minor security non-concern locally)
- IDs not universally unique (only per database)
- IDs continue incrementing even after deletion

**Status**: ✅ Approved - Simple and effective

---

### Decision 13: Automatic CreatedAt Timestamp

**Decision**: Database auto-sets createdAt timestamp on item creation

**Rationale**:
- Automatic, no manual timestamp handling
- Prevents user manipulation of creation time
- Provides audit trail of when items were added
- TypeORM @CreateDateColumn() decorator handles this
- Standard practice for entity timestamps
- Immutable after creation

**Alternatives Considered**:
1. **Manual Timestamp** - Client provides timestamp (easy to fake)
2. **No Timestamp** - No creation audit trail
3. **Both CreatedAt and UpdatedAt** - UpdatedAt not required for scope

**Tradeoffs**:
- Cannot manually set createdAt
- Cannot change after creation (immutable)
- Server clock determines timestamp (must be correct)

**Status**: ✅ Approved - Good for audit trail

---

### Decision 14: No Soft Fields (updatedAt, deletedAt)

**Decision**: Item entity includes only essential fields (id, name, qty, category, description, createdAt)

**Rationale**:
- Minimal, focused data model
- Meets requirements exactly
- No audit trail of updates (acceptable for local app)
- Simpler database schema
- Faster queries
- Appropriate for learning project

**Alternatives Considered**:
1. **With updatedAt** - Track all modifications
2. **With deletedAt** - Track deletions (soft delete)
3. **With version field** - Track update count
4. **With editor/author fields** - Track who made changes

**Tradeoffs**:
- Cannot see when item was last modified
- Cannot determine if data was updated today vs. weeks ago
- Data-heavy features would require schema changes

**Status**: ✅ Approved - Appropriate for scope

---

## Deployment and Runtime Decisions

### Decision 15: Synchronize: True in Development

**Decision**: Enable `synchronize: true` in TypeORM database connection

**Rationale**:
- Auto-creates tables on application startup
- No manual migration files needed
- Speeds up local development
- Easy schema changes during development
- Automatic schema sync with entity definitions
- Perfect for learning/prototyping

**Alternatives Considered**:
1. **Synchronize: False** - Manual migration files required
2. **Manual Database Setup** - User creates schema manually
3. **SQL Migration Tools** - More control but more complexity

**Tradeoffs**:
- **⚠️ NEVER use in production** - can destroy data
- Schema of truth in code, not database
- Potential for accidental schema loss with bad code

**Status**: ✅ Approved - FOR DEVELOPMENT ONLY

**🚨 CRITICAL**: Must set `synchronize: false` in production

---

### Decision 16: Port 3000 for Backend

**Decision**: Backend NestJS server runs on port 3000

**Rationale**:
- Standard Node.js default port
- Commonly available on development machines
- Easy for developers to remember
- Matches convention (http://localhost:3000)
- Not conflicting with WAMP ports
- Frontend hardcodes this URL

**Alternatives Considered**:
1. **Port 8000/8080** - Also standard, less common
2. **Port 5000** - Python default, can conflict
3. **Configurable port** - More complex startup

**Tradeoffs**:
- If port 3000 in use, must be freed or NestJS fails to start
- Hardcoded in frontend (requires code change to alter)
- Standard but not universal

**Status**: ✅ Approved - Standard and convenient

---

### Decision 17: No Environment Variables

**Decision**: Database credentials hardcoded in source (development only)

**Rationale**:
- Local development without complex setup
- WAMP default (root, no password) simplifies
- Single developer machine, no secrets to protect
- Reduces configuration management
- Clear what credentials are used

**Alternatives Considered**:
1. **Environment Variables** (.env file)
2. **Config Files** (config.json)
3. **Docker Compose** (adds complexity)
4. **Interactive Prompts** (annoying on startup)

**Tradeoffs**:
- **⚠️ Security issue in production** - credentials in source code
- Not suitable for deployment
- Secrets exposed in repository

**Status**: ✅ Approved - FOR LOCAL DEVELOPMENT ONLY

**🔒 Production Change**: Must use environment variables and secrets management

---

### Decision 18: CSS File (No Preprocessor)

**Decision**: Use plain CSS3 without SASS/LESS/PostCSS

**Rationale**:
- No build step required
- Direct browser compatibility
- Easier for beginners to debug (no compilation)
- CSS3 features sufficient for project
- No dependency management
- Faster iteration in development

**Alternatives Considered**:
1. **SASS/SCSS** - Better organization, but needs compilation
2. **Tailwind CSS** - Utility-first, but adds framework
3. **CSS Modules** - Scoping, but adds complexity
4. **Styled Components** - JavaScript CSS, overkill

**Tradeoffs**:
- No variables or mixins (more repetition)
- Loose scoping (careful naming needed)
- No vendor prefixing automation

**Status**: ✅ Approved - Simple and direct

---

### Decision 19: Single Frontend File Structure

**Decision**: Frontend uses simple file structure (index.html, add-item.html, edit-item.html)

**Rationale**:
- Multiple HTML pages, no single-page app complexity
- Each page is independent
- No need for routing framework
- Each page loads relevant JavaScript/CSS
- Familiar to traditional web developers
- Clear separation of concerns

**Alternatives Considered**:
1. **Single-Page App (SPA)** - React/Vue, but adds framework
2. **Server-side Rendering** - More complex backend setup
3. **Progressive Enhancement** - Hybrid approach, more work
4. **Web Components** - Component model, less browser support

**Tradeoffs**:
- Page reloads on navigation (no smooth SPA transitions)
- Code duplication between pages (HTML structure)
- No shared state between pages
- Larger total HTML size

**Status**: ✅ Approved - Simple and appropriate

---

## Frontend-Backend Communication Decisions

### Decision 20: No Request/Response Interceptors

**Decision**: Bare Fetch API without custom interceptor layer

**Rationale**:
- Learn fundamentals of HTTP client libraries
- No hidden request/response transformations
- Transparent error handling
- Easier to debug (everything visible)
- Meets project scope
- Simpler code for beginners

**Alternatives Considered**:
1. **Axios Library** - Built-in interceptors
2. **Custom HttpClient** - OOP wrapper around fetch
3. **Service Pattern** - Centralized API methods in service
4. **Redux/State Library** - Complex state management

**Tradeoffs**:
- Cannot globally alter requests (e.g., add auth headers)
- Cross-cutting concerns require duplication
- Error handling logic repeated in multiple places
- Learning tool, not production-grade

**Status**: ✅ Approved - Teaching tool, appropriate for scope

---

### Decision 21: Blocking Network Requests

**Decision**: API requests block UI (no background loading spinners everywhere)

**Rationale**:
- Local network calls are fast (usually < 100ms)
- Minimal user experience impact for local app
- Simpler frontend code
- User waits briefly, but feedback is immediate
- Meets project goals

**Alternatives Considered**:
1. **Async/Loading State** - Show spinners, more complex
2. **Web Workers** - Background processing, overkill
3. **Optimistic Updates** - Assume success, complex
4. **Skeleton Screens** - Placeholder UI, adds code

**Tradeoffs**:
- UI appears unresponsive during requests (couple 100ms)
- Poor perception for slow networks
- Not suitable for slower backends or slow connections
- Would need loading indicators for production

**Status**: ✅ Approved - Acceptable for local development

---

## Development Workflow Decisions

### Decision 22: No Build Step for Frontend

**Decision**: Frontend loads TypeScript via ES modules (no bundler)

**Assumption/Note**: Frontend TypeScript files can be served as-is or with simple compilation

**Rationale**:
- No webpack/Parcel/Vite configuration
- Faster development cycle
- Fewer tool abstractions
- Direct browser compatibility
- TypeScript src files are self-contained

**Alternatives Considered**:
1. **Webpack** - Feature-rich but complex
2. **Vite** - Fast, but adds build step
3. **Parcel** - Zero-config, still a build tool
4. **No Tooling** - Plain JavaScript only

**Tradeoffs**:
- TypeScript must be compiled to JavaScript before browser loads
- Module loading must work in browser
- Cannot use advanced TypeScript features requiring transpilation
- Larger initial payload for compiled files

**Status**: ✅ Approved - Reduces tooling complexity

---

### Decision 23: Manual Testing Only

**Decision**: No unit tests, integration tests, or e2e tests in initial version

**Rationale**:
- Project scope is learning and functionality, not testing
- Manual testing sufficient for small codebase
- Reduces initial development time
- Easier for beginners to understand code without test abstractions
- Testing framework setup adds complexity
- Meets minimum viable product for education

**Alternatives Considered**:
1. **Jest Unit Tests** - Framework with good TypeScript support
2. **Cypress E2E Tests** - Full application testing
3. **Vitest** - Lightweight test runner
4. **Test-Driven Development** - Write tests first

**Tradeoffs**:
- No automated regression detection
- Time-consuming manual testing for changes
- Risk of introducing bugs when refactoring
- Not suitable for team development

**Status**: ✅ Approved - Acceptable for learning project

**📝 Note**: Tests can be added later if project grows

---

## Scalability and Future Decisions

### Decision 24: No Pagination

**Decision**: Fetch and display all items in single request/page

**Rationale**:
- Simplifies frontend (no pagination UI/logic needed)
- Simplifies backend (no offset/limit queries)
- Acceptable for reasonable dataset size (up to ~1000 items)
- Meets scope (simple local inventory)
- Faster to implement

**Alternatives Considered**:
1. **Server-side Pagination** - Offset/limit queries
2. **Cursor-based Pagination** - More complex, better for large sets
3. **Infinite Scroll** - Client-side dynamic loading
4. **Virtual Scrolling** - Only render visible items

**Tradeoffs**:
- All data loaded at once (memory cost)
- Larger initial payload
- No support for millions of items
- Page becomes slow with 10,000+ items

**Status**: ✅ Approved - Acceptable up to ~1000 items

**📈 Future Work**: Add pagination if dataset grows

---

### Decision 25: No Search or Filtering

**Decision**: No search by name or filter by category initially

**Rationale**:
- Reduces scope and complexity
- Meets basic CRUD requirements
- User can view all items and scroll/scan
- Acceptable for small inventory (< 100 items)

**Alternatives Considered**:
1. **Full-Text Search** - Search API endpoint
2. **Category Filtering** - Filter by category
3. **Advanced Filters** - Qty range, date range, etc.
4. **Search as You Type** - Client-side filtering

**Tradeoffs**:
- User must scroll through entire list
- No quick way to find specific item
- UI doesn't leverage category field effectively
- Poor for large inventories

**Status**: ✅ Approved - Can be added in future

---

## Summary Table

| Decision | Category | Risk Level | Status |
|----------|----------|-----------|--------|
| D-1: NestJS | Technology | Low | ✅ Approved |
| D-2: TypeScript | Technology | Low | ✅ Approved |
| D-3: TypeORM | Technology | Low | ✅ Approved |
| D-4: MySQL | Technology | Low | ✅ Approved |
| D-5: Vanilla TS Frontend | Technology | Low | ✅ Approved |
| D-6: Fetch API | Technology | Low | ✅ Approved |
| D-7: REST API | Architecture | Low | ✅ Approved |
| D-8: CORS Enabled | Architecture | Medium | ✅ Approved (Dev Only) |
| D-9: No Auth | Architecture | Medium | ✅ Approved (Dev Only) |
| D-10: No Versioning | Architecture | Low | ✅ Approved |
| D-11: Hard Delete | Data Model | Low | ✅ Approved |
| D-12: Auto-Increment IDs | Data Model | Low | ✅ Approved |
| D-13: CreatedAt Timestamp | Data Model | Low | ✅ Approved |
| D-14: Minimal Fields | Data Model | Low | ✅ Approved |
| D-15: Synchronize: True | Deployment | High | ✅ Approved (Dev Only) |
| D-16: Port 3000 | Deployment | Low | ✅ Approved |
| D-17: Hardcoded Credentials | Deployment | High | ✅ Approved (Dev Only) |
| D-18: Plain CSS | Frontend | Low | ✅ Approved |
| D-19: Multi-Page Frontend | Frontend | Low | ✅ Approved |
| D-20: No Interceptors | Frontend | Low | ✅ Approved |
| D-21: Blocking Requests | Frontend | Low | ✅ Approved |
| D-22: No Build Step | Tooling | Low | ✅ Approved |
| D-23: No Tests | Testing | Medium | ✅ Approved |
| D-24: No Pagination | Scalability | Low | ✅ Approved (Future) |
| D-25: No Search | Scope | Low | ✅ Approved (Future) |

---

## Transition to Production Checklist

🚨 **Before deploying to production, these decisions must be reversed:**

- [ ] Set `synchronize: false` (migrations required)
- [ ] Use environment variables for database credentials
- [ ] Implement authentication and authorization
- [ ] Restrict CORS to specific origins
- [ ] Enable HTTPS
- [ ] Add error logging and monitoring
- [ ] Implement input validation and sanitization
- [ ] Add rate limiting
- [ ] Implement API versioning strategy
- [ ] Add pagination for large datasets
- [ ] Add search and filtering
- [ ] Implement comprehensive testing (unit, integration, e2e)
- [ ] Add user audit logs
- [ ] Database backups and recovery strategy
- [ ] Load balancing and horizontal scaling
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Security hardening (OWASP top 10)

This project is **designed for local development only**. Most decisions prioritize simplicity and learning over security and scalability.
