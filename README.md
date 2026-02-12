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
  - Transactional storage tracking ensures accurate usage accounting

- **Authentication, validation, and security (Passport + express-validator + rate limiting)**
  - Local strategy with bcrypt password hashing
  - Persistent login via secure cookie-based sessions
  - Auth guards (middleware) for protected routes
  - Rate limiting on sensitive routes to prevent brute-force attacks

- **Cloud file storage with Cloudinary**
  - Multer memoryStorage parses file uploads (5MB max)
  - Files stored with UUID-based public IDs; any file type supported
  - Direct download URLs generated on demand

- **Hierarchical folder organization**
  - Create nested folders with unlimited depth
  - Move files and folders between locations
  - Cascading deletes (folder deletion removes all contents)

- **Accessible, responsive UI (EJS + Tailwind + Flowbite)**
  - Mobile-first responsive design with light/dark mode
  - Favorites, search, and recent files for quick navigation
  - Flash messages for user feedback

- **Full integration tests (Jest + Supertest)**
  - Isolated test environments with DB setup/teardown
  - Mocked Cloudinary calls for reliable testing
