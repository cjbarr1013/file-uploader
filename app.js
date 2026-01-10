require('dotenv').config();
const express = require('express');
const path = require('path');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const prisma = require('./utils/db');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const expressLayouts = require('express-ejs-layouts');
const authRouter = require('./routes/authRouter');
const favoritesRouter = require('./routes/favoritesRouter');
const filesRouter = require('./routes/filesRouter');
const foldersRouter = require('./routes/foldersRouter');
const indexRouter = require('./routes/indexRouter');
const searchRouter = require('./routes/searchRouter');
const userRouter = require('./routes/userRouter');
const Folder = require('./models/folder');
const { formatDate, getImageUrl } = require('./utils/helpers');

// app initialization
const app = express();

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// access public assets
const assetsPath = path.join(__dirname, 'public');
app.use(express.static(assetsPath));

// allows req.body to access submitted HTML form data
app.use(express.urlencoded({ extended: true }));

// sessions and authentication
const sessionStore = new PrismaSessionStore(prisma, {
  checkPeriod: 10 * 60 * 1000, // ms, equals 10 minutes
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: undefined,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // ms, equals one day
      httpOnly: true, // Prevents JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // HTTPS-only in production
      sameSite: 'lax', // Prevents CSRF attacks
    },
  })
);

require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// misc. middleware and variables
app.use(async (req, res, next) => {
  // locals
  res.locals.currentUser = req.user;
  res.locals.flash = {
    // needed for clean EJS (i.e. <%= flash.formData?.name %>)
    success: req.flash('success'),
    formErrors: req.flash('formErrors'),
    flashErrors: req.flash('flashErrors'),
    formData: req.flash('formData')[0], // will always be a single object
    showModal: req.flash('showModal')[0], // will always be a single ID
  };
  res.locals.formatDate = formatDate;
  res.locals.originalUrl = req.originalUrl;
  res.locals.getImageUrl = getImageUrl;
  res.locals.folderList =
    req.user ? await Folder.findAll(req.user.id).catch(() => []) : []; // catch error so app does not crash
  // session
  next();
});

// serve Flowbite directly from node_modules (no manual copying)
app.use(
  '/vendor/flowbite',
  express.static(path.join(__dirname, 'node_modules/flowbite/dist'))
);

// express ejs layouts
app.use(expressLayouts);
// Optionally set default layout w/ app.set('layout', 'views/layouts/dashboard');

// routes
app.use('/auth', authRouter);
app.use('/favorites', favoritesRouter);
app.use('/files', filesRouter);
app.use('/folders', foldersRouter);
app.use('/search', searchRouter);
app.use('/user', userRouter);
app.use('/', indexRouter);

// error handling
app.use((req, res) => {
  return res.status(404).render('pages/404', {
    layout: 'layouts/error',
    title: '404: Page Not Found',
  });
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status !== 404) console.error(err);
  return res.status(status).json({ error: { status, message: err.message } });
});

module.exports = app;
