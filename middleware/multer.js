const multer = require('multer');
const { redirectErrorForm } = require('../utils/helpers');

const storage = multer.memoryStorage();

const parseImageFile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for profile images
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
    }
  },
}).single('pic');

const parseFile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for general files
}).single('upload');

const handlePicMulterError = (err, req, res, next) => {
  const { first, last, pic } = req.body;
  // handle file size too big error
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return redirectErrorForm(
        req,
        res,
        [{ msg: 'File too large. Maximum size is 10MB.' }],
        req.body.returnTo || '/',
        { first, last, pic },
        'edit-profile-modal'
      );
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return redirectErrorForm(
        req,
        res,
        [{ msg: 'Invalid file type. Only JPEG, PNG, and WebP allowed.' }],
        req.body.returnTo || '/',
        { first, last, pic },
        'edit-profile-modal'
      );
    }
  }
  return next(err);
};

const handleUploadMulterError = (err, req, res, next) => {
  const { upload, parentId } = req.body;
  // handle file size too big error
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return redirectErrorForm(
        req,
        res,
        [{ msg: 'File too large. Maximum size is 5MB.' }],
        req.body.returnTo || '/',
        { upload, parentId },
        'upload-file-modal'
      );
    }
  }
  return next(err);
};

module.exports = {
  parseImageFile,
  parseFile,
  handlePicMulterError,
  handleUploadMulterError,
};
