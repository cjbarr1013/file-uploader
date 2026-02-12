# File Uploader (Cirrus)

### [LIVE WEBSITE](https://file-uploader-production-52d9.up.railway.app/)

A personal cloud storage platform (similar to Google Drive/Dropbox) made as part of [The Odin Project](https://www.theodinproject.com/lessons/nodejs-file-uploader). Try it out above!

## Tech Stack

  - Node.js + Express
  - EJS templates
  - Tailwind CSS
  - Prisma + PostgreSQL
  - Passport (local strategy)
  - Multer (memoryStorage) + Cloudinary
  - express-validator
  - express-rate-limit
  - Flowbite components

  ## Features

  - **Express + Node.js full-stack application following MVC structure**
    - Clear separation of concerns: routes → controllers → models → views
    - Controllers orchestrate validation, auth, DB calls, and view rendering
    - Reusable helpers for Cloudinary uploads, downloads, and deletions

  - **Prisma + PostgreSQL data layer**
    - Type-safe database queries with Prisma ORM
    - Session storage backed by Postgres (@quixo3/prisma-session-store)
    - Database migrations and seeding for development and testing

  - **Authentication and Validation (Passport + sessions + express-validator)**
    - Local strategy with bcrypt password hashing
    - Persistent login via secure cookie-based sessions
    - Sign-in, sign-up, and sign-out flows
    - Auth guards (middleware) for protected routes
    - Validation for user input provided by express-validator

  - **Security and rate limiting**
    - Rate limiting on sensitive routes to prevent brute-force attacks
    - Separate rate limits for authentication and file operations

  - **Cloud file storage with Cloudinary**
    - Multer memoryStorage parses file uploads (5MB max)
    - Files stored in Cloudinary with UUID-based public IDs
    - Support for any file type (images, documents, videos, etc.)
    - Direct download URLs generated on demand
    - Profile picture uploads with dedicated storage path

  - **Hierarchical folder organization**
    - Create nested folders with unlimited depth
    - Move files and folders between locations
    - Cascading deletes (folder deletion removes all contents)
    - Root-level and nested file storage

  - **Storage tracking and management**
    - Real-time storage usage tracking per user
    - Prisma transactions ensure accurate storage accounting
    - Storage incremented/decremented atomically with file operations

  - **User experience features**
    - Favorites system for quick access to important items
    - Search functionality across files and folders
    - Recently accessed files tracking
    - Flash messages for user feedback

  - **Accessible, responsive UI (EJS + Tailwind + Flowbite)**
    - Mobile-first responsive design
    - Tailwind for utility-first styling; production build purged and minified
    - Flowbite components for modals, dropdowns, and sidebars
    - Light/Dark mode support

  - **Full integration tests (Jest + Supertest)**
    - Global DB setup/teardown for isolated test environments
    - Tests cover models and controllers
    - Mocked Cloudinary calls for reliable testing
