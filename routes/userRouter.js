const { Router } = require('express');
const userController = require('../controllers/userController');
const { isAuthAction } = require('../middleware/auth');
const { parseImageFile, handleMulterError } = require('../middleware/multer');
const userRouter = Router();

// routes
userRouter.post(
  '/edit',
  isAuthAction,
  parseImageFile,
  handleMulterError, // handle file size too big error before server upload
  userController.validateFirstAndLast,
  userController.postEdit
);
userRouter.post('/delete', isAuthAction, userController.postDelete);

module.exports = userRouter;
