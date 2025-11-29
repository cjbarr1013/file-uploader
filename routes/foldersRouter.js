const { Router } = require('express');
const folderController = require('../controllers/folderController');
const itemsController = require('../controllers/itemsController');
const { isAuthAction, isAuthRoute } = require('../middleware/auth');
const foldersRouter = Router();

// routes
foldersRouter.post(
  '/create',
  isAuthAction,
  folderController.validateName,
  folderController.postCreate
);

foldersRouter.get('/:id', isAuthRoute, itemsController.getFolder);

foldersRouter.post(
  '/:id/edit/name',
  isAuthAction,
  folderController.validateName,
  folderController.postEditName
);

foldersRouter.post(
  '/:id/edit/location',
  isAuthAction,
  folderController.postEditLocation
);

foldersRouter.post(
  '/:id/edit/favorite',
  isAuthAction,
  folderController.postEditFavorite
);

foldersRouter.post('/:id/delete', isAuthAction, folderController.postDelete);

module.exports = foldersRouter;
