const multer = require('multer');

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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for general files
}).single('upload');

const handleMulterError = (err, req, res, next) => {
  const { first, last, pic } = req.body;
  // handle file size too big error
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      req.flash('errors', [{ msg: 'File too large. Maximum size is 10MB.' }]);
      req.flash('formData', { first, last, pic });
      req.flash('showModal', true);
      return res.redirect('back');
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      req.flash('errors', [
        { msg: 'Invalid file type. Only JPEG, PNG, and WebP allowed.' },
      ]);
      req.flash('formData', { first, last, pic });
      req.flash('showModal', true);
      return res.redirect('back');
    }
  }
  return next(err);
};

module.exports = { parseImageFile, parseFile, handleMulterError };
