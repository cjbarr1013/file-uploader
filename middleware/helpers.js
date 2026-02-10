function normalizeUploadName(req, res, next) {
  if (req.body.itemName === undefined) {
    const lastIndex = req.file.originalname.lastIndexOf('.');
    req.body.itemName = req.file.originalname.slice(0, lastIndex);
  }
  next();
}

module.exports = {
  normalizeUploadName,
};
