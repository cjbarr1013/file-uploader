const { Router } = require('express');
const userController = require('../controllers/userController');
const {
  isAuthAction,
  isNotAuthRoute,
  isNotAuthAction,
} = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const authRouter = Router();

// routes
authRouter.get('/register', isNotAuthRoute, userController.getRegister);
authRouter.post(
  '/register',
  authLimiter,
  isNotAuthAction,
  userController.validateFirstAndLast,
  userController.validateUsernameAndPassword,
  userController.postRegister
);
authRouter.get('/login', isNotAuthRoute, userController.getLogin);
authRouter.post(
  '/login',
  authLimiter,
  isNotAuthAction,
  userController.postLogin
);
authRouter.post('/logout', isAuthAction, userController.postLogout);

module.exports = authRouter;
