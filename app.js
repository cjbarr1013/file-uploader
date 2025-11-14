require('dotenv').config();
const express = require('express');
const path = require('path');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const prisma = require('./utils/db');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');

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

// require('./config/passport');
// app.use(passport.initialize());
// app.use(passport.session());
app.use(flash());

// misc. middleware and variables
app.use((req, res, next) => {
  // locals
  res.locals.currentUser = req.user;
  res.locals.messages = req.flash();

  // session
  next();
});

// serve Flowbite directly from node_modules (no manual copying)
app.use(
  '/vendor/flowbite',
  express.static(path.join(__dirname, 'node_modules/flowbite/dist'))
);

// routes
app.use('/', (req, res) => {
  return res.status(200).send('hello');
});

// error handling
app.use((req, res) => {
  return res.status(404).send('404 not found.');
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status !== 404) console.error(err);
  return res.status(status).json({ error: { status, message: err.message } });
});

module.exports = app;
