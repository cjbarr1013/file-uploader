const { Router } = require('express');
const userController = require('../controllers/userController');
const { isAuthAction } = require('../middleware/auth');
const {
  parseImageFile,
  handlePicMulterError,
} = require('../middleware/multer');
const userRouter = Router();

// routes
userRouter.post(
  '/edit',
  isAuthAction,
  parseImageFile,
  handlePicMulterError, // handle file size too big error before server upload
  userController.validateFirstAndLast,
  userController.postEdit
);
userRouter.post('/delete', isAuthAction, userController.postDelete);
userRouter.post(
  '/sort-preference',
  isAuthAction,
  userController.postSortPreference
);

module.exports = userRouter;
