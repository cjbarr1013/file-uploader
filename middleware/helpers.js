function normalizeUploadName(req, res, next) {
  if (req.body.itemName === undefined) {
    req.body.itemName = req.file.originalname.split('.')[0];
  }
  next();
}

module.exports = {
  normalizeUploadName,
};
