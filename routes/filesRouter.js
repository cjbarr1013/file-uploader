const { Router } = require('express');
const fileController = require('../controllers/fileController');
const { isAuthAction, isAuthRoute } = require('../middleware/auth');
const { parseFile, handleUploadMulterError } = require('../middleware/multer');
const { normalizeUploadName } = require('../middleware/helpers');
const { uploadLimiter } = require('../middleware/rateLimiter');
const filesRouter = Router();

// routes
filesRouter.get('/recent', isAuthRoute, fileController.getRecent);

filesRouter.post(
  '/upload',
  uploadLimiter,
  isAuthAction,
  parseFile,
  handleUploadMulterError,
  normalizeUploadName,
  fileController.validateUpload,
  fileController.validateName,
  fileController.postUpload
);

filesRouter.get('/:id/download', isAuthRoute, fileController.getDownload);

filesRouter.post(
  '/:id/edit/name',
  isAuthAction,
  fileController.validateName,
  fileController.postEditName
);

filesRouter.post(
  '/:id/edit/location',
  isAuthAction,
  fileController.postEditLocation
);

filesRouter.post(
  '/:id/edit/favorite',
  isAuthAction,
  fileController.postEditFavorite
);
filesRouter.post('/:id/delete', isAuthAction, fileController.postDelete);

module.exports = filesRouter;
