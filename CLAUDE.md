# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Interaction Style

- Always explain the problem and solution options fully before implementing
- Wait for user confirmation before making code changes
- When asked a question, answer it completely before suggesting or making edits

## Project Overview

A file storage platform (similar to Google Drive/Dropbox) built with Node.js/Express and PostgreSQL. Users can upload files, organize them in folders, track storage usage, and manage their content.

## Tech Stack

**Core**

- Express + EJS - Server-side rendering
- Prisma + PostgreSQL - Database & ORM

**Authentication**

- Passport (Local Strategy) - Session-based authentication
- express-session - Session middleware
- connect-flash - Flash messages for user feedback

**File Management**

- Cloudinary - Cloud file storage
- Multer - File upload handling

**Frontend**

- Tailwind CSS - Utility-first styling
- Flowbite - Component library

**Testing**

- Jest + Supertest - Integration & unit tests

**Validation**

- express-validator - Request validation

**Code Quality**

- ESLint - JavaScript linter
- Prettier - Code formatter

## Code Conventions

- Use descriptive variable names (e.g., `hashedPassword`, not `hp`)
- Always use `async/await` for asynchronous operations
- Comment the "why", not the "what"
- **Mobile-first responsive design** - All frontend development uses mobile-first approach with Tailwind CSS breakpoints (default styles for mobile, then `sm:`, `md:`, `lg:`, `xl:` for larger screens)

## Development Commands

```bash
# Development server with auto-reload
npm run dev

# Database operations
npm run prisma-migrate          # Create and apply migrations
npm run prisma-reset-and-seed   # Reset DB and reseed data
npm run prisma-studio           # Open Prisma Studio GUI
npm run prisma-seed             # Seed database only

# Testing
npm test                        # Run all tests
npm test -- --watch            # Watch mode
npm test path/to/test.js       # Run specific test file
npm test -- -t "test name"     # Run tests matching name

# Code quality
npm run format                 # Format with Prettier
npm run lint                   # Run ESLint

# CSS (Tailwind)
npm run build-css              # Build and watch CSS
npm run build-css-prod         # Build minified CSS for production
```

## Architecture

### Project Structure

```
file-uploader/
├── config/          # App configuration (Passport, Cloudinary, session)
├── middleware/      # Auth guards, error handlers, Multer config
├── routes/          # Express route definitions (indexRouter)
│   ├── indexRouter.js
│   ├── authRouter.js
│   ├── userRouter.js
│   ├── filesRouter.js
│   ├── foldersRouter.js
│   ├── favoritesRouter.js
│   └── searchRouter.js
├── controllers/     # Request handlers & business logic
│   ├── userController.js
│   ├── fileController.js
│   ├── folderController.js
│   └── itemsController.js
├── models/          # Database operations (Prisma)
│   ├── user.js
│   ├── file.js
│   ├── folder.js
│   └── items.js
├── views/           # EJS templates
│   ├── layouts/     # Base page structure
│   ├── pages/       # Page content, used in layouts
│   ├── partials/    # Reusable UI fragments (head, nav, sidebar, etc.)
│   ├── components/  # Standalone components (cards, buttons, badges, etc.)
│   └── forms/       # Forms
├── public/          # Static assets (served via express.static)
│   ├── styles/      # Input and Output for Tailwind CSS
│   ├── js/          # Client-side JavaScript
│   ├── images/      # Image assets
│   ├── icons/       # Icon files
│   └── fonts/       # Custom fonts
├── utils/           # Helper functions (Cloudinary, validators)
├── prisma/          # Database schema & migrations
└── tests/           # Jest tests
    ├── globalSetup.js
    ├── globalTeardown.js
    ├── setupTests.js
    ├── helpers/
    ├── fixtures/
    ├── integration/
    │   ├── models/
    │   └── controllers/
    └── unit/
```

### MVC Pattern

- **Models** (`models/`): Database operations via Prisma. Each model exports methods like `create()`, `findById()`, `update()`, `delete()`.
- **Controllers** (`controllers/`): Request handlers with validation middleware. Renders or redirects to EJS templates.
- **Routes** (`routes/`): Define endpoints and apply middleware (auth, validation, multer).
- **Views** (`views/`): EJS templating. Incorporates TailwindCSS, Flowbite, and static assets (served via `express.static`) found in `public/` (`styles/`, `js/`, `images/`, `icons/`, `fonts/`).

### Key Architectural Patterns

**Storage Tracking with Transactions**
File uploads/deletes use Prisma transactions to maintain accurate `User.storageUsed`:

- On create: increment storage by file size
- On delete: decrement storage by file size
- See `models/file.js` for implementation

**Cloudinary Integration**
Files are stored in Cloudinary, not the local filesystem:

- File uploads generate a UUID (`crypto.randomUUID()`) as `cloudinaryPublicId`
- Database stores metadata + `cloudinaryPublicId`, not the actual file
- Helpers in `utils/helpers.js` handle upload/download/delete from Cloudinary
- Resource type (raw/image/video) determined by mimetype
- Files stored in folder: `file-uploader/user-files/{cloudinaryPublicId}`
- Profile pictures stored in: `file-uploader/user-images/{username}`

**Authentication Flow**

- Passport Local Strategy with session-based auth
- Sessions stored in PostgreSQL via `@quixo3/prisma-session-store`
- Four middleware guards in `middleware/auth.js`:
  - `isAuthRoute` / `isAuthAction` - protect authenticated routes/actions
  - `isNotAuthRoute` / `isNotAuthAction` - prevent logged-in users from accessing login/register
- **Username case-insensitivity**: All usernames are converted to lowercase on registration and lookup (`User.create()` and `User.findByUsername()`)

**Passport Custom Callback Pattern**

Instead of using passport's built-in redirect/flash handling, we use a custom callback to maintain consistent error formatting:

```javascript
// controllers/userController.js
function postLogin(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      // Auth failed - manually format error to match validation errors
      return redirectErrorForm(
        req, res,
        [{ msg: info.message }],  // Consistent {msg: '...'} format
        '/auth/login',
        { username: req.body.username }  // Preserve username in form
      );
    }

    // Auth succeeded - manually log user in
    req.login(user, (err) => {
      if (err) return next(err);
      req.flash('success', [{ msg: info.message }]);
      return res.redirect('/');
    });
  })(req, res, next);  // Immediately invoke the middleware
}
```

The custom callback receives:
- `err` - Database or system errors
- `user` - The authenticated user object (or `false` if auth failed)
- `info` - Message object from strategy: `{ message: 'User does not exist.' }`

**Flash Message Organization**

We use separate flash keys for different purposes:

- `formErrors` - Form validation errors (express-validator or manual)
- `flashErrors` - General flash errors (non-form errors)
- `formData` - Form data to repopulate fields after errors
- `success` - Success messages
- `showModal` - Modal ID string to show on page reload (e.g., `'create-folder-modal'`)

All error/success messages use consistent `{msg: '...'}` format to match express-validator.

**Flowbite JavaScript API**

Flowbite is loaded with `defer` for optimal performance and auto-initializes components that have trigger elements with data attributes (e.g., `data-modal-toggle`, `data-dropdown-toggle`).

**Accessing Component Instances:**

```javascript
// Use FlowbiteInstances.getInstance() to access initialized components
const modal = FlowbiteInstances.getInstance('Modal', 'modal-id');
modal.show();
modal.hide();
modal.toggle();
```

**Key Requirements:**

1. **Script Loading**: Flowbite must be loaded with `defer` in `<head>`, and scripts that use Flowbite should also use `defer` or run after the `load` event
2. **Auto-initialization**: Flowbite automatically initializes components when it finds trigger elements with data attributes like `data-modal-toggle="modal-id"`
3. **Instance Availability**: Use `window.addEventListener('load')` to ensure instances are initialized before accessing them

**Modal Auto-Show Pattern:**

To show a modal on page reload after form errors:

1. Pass modal ID through flash: `redirectErrorForm(req, res, errors, '/', formData, 'modal-id')`
2. Add modal ID to body: `<body data-show-modal="<%= flash.showModal %>">`
3. Use client-side script to show modal:

```javascript
// public/js/showModalCheck.js
window.addEventListener('load', function () {
  const modalId = document.body.dataset.showModal;
  if (modalId) {
    const modal = FlowbiteInstances.getInstance('Modal', modalId);
    if (modal) modal.show();
  }
});
```

**Ensuring Components Initialize:**

Flowbite only initializes components that have trigger buttons with `data-modal-target` or `data-modal-toggle` attributes. For modals without visible triggers, add hidden trigger buttons:

```html
<div class="hidden">
  <button data-modal-target="modal-id" data-modal-toggle="modal-id"></button>
</div>
```

**File Upload Flow**

1. Multer parses multipart/form-data and loads file into memory (`req.file.buffer`)
2. Controller generates UUID for `cloudinaryPublicId`
3. Helper uploads buffer to Cloudinary with UUID as public_id
4. Database record created with Cloudinary metadata
5. User's `storageUsed` incremented in same transaction

**Hierarchical Folders**

- Self-referential relationship: `Folder.parent` → `Folder` (optional)
- Files can belong to a folder or be at root level (`File.folderId` is nullable)
- Cascading deletes: deleting user → deletes folders → deletes files

### Database Schema Notes

**BigInt Usage**
`User.storageUsed` is `BigInt` (not `Int`). In JavaScript, Prisma returns these with `n` suffix:

```javascript
user.storageUsed = 1024n; // BigInt value
Number(user.storageUsed); // Convert to regular number for display
expect(user.storageUsed).toBe(1024n); // Use 'n' in test assertions
```

**Unique Constraints**

- `User.username` is unique
- `File.cloudinaryPublicId` is unique (prevents duplicate Cloudinary uploads)

**Cascading Deletes**

- Delete user → deletes all folders and files
- Delete folder → deletes subfolders and files within
- Delete file → decrements user's `storageUsed` (via transaction in model)

## Testing

**Jest Configuration**

- `testEnvironment: "node"` - Backend testing
- `clearMocks: true` - Automatically clears mocks between tests
- Tests run with `--runInBand` (sequentially) due to database operations
- Uses `.env.test` for test database connection

**Test Database Setup**

- `globalSetup.js` runs `prisma migrate reset` once before all tests
- `setupTests.js` truncates and reseeds database before each test
- Ensures isolated, predictable test state

**Mocking Cloudinary**
All controller tests mock `utils/helpers` to avoid real Cloudinary API calls:

```javascript
jest.mock('../../../utils/helpers', () => ({
  uploadFileBuffer: jest.fn().mockResolvedValue({
    /* fake response */
  }),
  getDownloadUrl: jest.fn(
    (id, format, name) => `https://fake-cloudinary.com/${id}/${name}`
  ),
  deleteFile: jest.fn().mockResolvedValue({ result: 'ok' }),
}));
```

**Test Structure**

- `tests/integration/models/` - Model CRUD operations
- `tests/integration/controllers/` - Controller request/response behavior
- Use `request.agent()` to maintain session across requests in tests

## Common Gotchas

**Express Validator with Multer**
Validation must come AFTER multer middleware since validators check `req.file`:

```javascript
router.post('/upload', parseFile, validateUpload, postUpload);
//                     ^^^^^^^^^  ^^^^^^^^^^^^^^
//                     multer     validation (checks req.file)
```

**File Size is in Bytes**
`req.file.size` from multer is in bytes. File size limit: `5 * 1024 * 1024` (5MB).

**Flash Messages**

Flash messages are organized by purpose and retrieved in middleware:

```javascript
// app.js - Flash middleware
app.use((req, res, next) => {
  res.locals.flash = {
    formErrors: req.flash('formErrors'),      // Array - keep as is
    flashErrors: req.flash('flashErrors'),    // Array - keep as is
    success: req.flash('success'),            // Array - keep as is
    formData: req.flash('formData')[0],       // Single object - extract with [0]
    showModal: req.flash('showModal')[0],     // Single boolean - extract with [0]
  };
  next();
});
```

**Why `[0]`?** `req.flash()` always returns an array, even for single values. Extract single values with `[0]`.

**Helper Functions** (`utils/helpers.js`):

```javascript
// For form errors with form data preservation and optional modal display
redirectErrorForm(req, res, errors, path, formData = null, modalId = null)

// For general flash errors without form data
redirectErrorFlash(req, res, errors, path)

// For success messages
redirectSuccess(req, res, success, path)
```

All messages must be in `[{msg: '...'}]` format (arrays of objects with `msg` property).

When `modalId` is provided in `redirectErrorForm`, the specified modal will automatically open on page reload to display the errors.

## Environment Variables

Required in `.env`:

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session secret
- `CLOUDINARY_CLOUD_NAME` - Cloudinary account name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

Test environment uses `.env.test` with separate test database.

## Project Constraints

- **5MB max file size** - Enforced by Multer configuration
- **File types** - No restrictions on upload (only profile pictures are restricted to images)
- **No sharing/permissions** - Each user sees only their own files/folders
