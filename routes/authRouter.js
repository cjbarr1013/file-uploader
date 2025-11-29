const { Router } = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');
const {
  isAuthAction,
  isNotAuthRoute,
  isNotAuthAction,
} = require('../middleware/auth');
const authRouter = Router();

// routes
authRouter.get('/register', isNotAuthRoute, userController.getRegister);
authRouter.post(
  '/register',
  isNotAuthAction,
  userController.validateFirstAndLast,
  userController.validateUsernameAndPassword,
  userController.postRegister
);
authRouter.get('/login', isNotAuthRoute, userController.getLogin);
authRouter.post(
  '/login',
  isNotAuthAction,
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    successFlash: true,
    failureFlash: true,
    keepSessionInfo: true, // needed so error/success msgs persist to redirect
  })
);
authRouter.post('/logout', isAuthAction, userController.postLogout);

module.exports = authRouter;
