const { body, validationResult } = require('express-validator');
const Folder = require('../models/folder');

const validateName = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Folder must have a name.')
    .bail()
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters.'),
];

async function postCreate(req, res, next) {
  const { name, parentId } = req.body;
  const errors = validationResult(req);
  const normalizedParentId = parentId ? Number.parseInt(parentId) : null;

  if (!errors.isEmpty()) {
    req.flash('errors', errors);
    req.flash('formData', { name, parentId });
    req.flash('showModal', true);
    return res.redirect('back');
  }

  try {
    await Folder.create({
      name,
      parentId: normalizedParentId,
      creatorId: req.user.id,
    });
    req.flash('success', 'Folder created.');
    return res.redirect('back');
  } catch (err) {
    return next(err);
  }
}

async function postEditName(req, res, next) {
  const { name } = req.body;
  const { id } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('errors', errors);
    req.flash('formData', { name });
    req.flash('showEditName', true);
    return res.redirect('back');
  }

  const folderId = id ? Number.parseInt(id) : null;

  try {
    await Folder.update(folderId, req.user.id, { name });
    req.flash('success', 'Folder name updated.');
    return res.redirect('back');
  } catch (err) {
    return next(err);
  }
}
async function postEditLocation(req, res, next) {
  const { parentId } = req.body;
  const { id } = req.params;

  const normalizedParentId = parentId ? Number.parseInt(parentId) : null;
  const folderId = id ? Number.parseInt(id) : null;

  try {
    await Folder.update(folderId, req.user.id, {
      parentId: normalizedParentId,
    });
    req.flash('success', 'Folder location updated.');
    return res.redirect('back');
  } catch (err) {
    return next(err);
  }
}
async function postEditFavorite(req, res, next) {
  const { id } = req.params;
  const folderId = id ? Number.parseInt(id) : null;

  try {
    const folder = await Folder.findById(folderId, req.user.id);
    const isFavorite = !folder.favorite;
    await Folder.update(folderId, req.user.id, { favorite: isFavorite });
    req.flash(
      'success',
      isFavorite ?
        'Folder added to favorites.'
      : 'Folder removed from favorites.'
    );
    return res.redirect('back');
  } catch (err) {
    return next(err);
  }
}

async function postDelete(req, res, next) {
  const { id } = req.params;
  const folderId = id ? Number.parseInt(id) : null;
  try {
    await Folder.delete(folderId, req.user.id);
    req.flash('success', 'Folder deleted.');
    return res.redirect('back');
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  validateName,
  postCreate,
  postEditName,
  postEditLocation,
  postEditFavorite,
  postDelete,
};
