const { body, validationResult } = require('express-validator');
const Folder = require('../models/folder');
const {
  redirectErrorForm,
  redirectErrorFlash,
  redirectSuccess,
} = require('../utils/helpers');

const validateName = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Folder must have a name.')
    .bail()
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters.'),
];

async function postCreate(req, res) {
  const { name, parentId } = req.body;
  const errors = validationResult(req);
  const normalizedParentId = parentId ? Number.parseInt(parentId) : null;

  if (!errors.isEmpty()) {
    return redirectErrorForm(
      req,
      res,
      errors.array(),
      'back',
      { name, parentId },
      true
    );
  }

  try {
    await Folder.create({
      name,
      parentId: normalizedParentId,
      creatorId: req.user.id,
    });

    return redirectSuccess(req, res, 'Folder created successfully.', 'back');
  } catch (err) {
    console.error('Failed to create folder:', err);
    return redirectErrorFlash(
      req,
      res,
      [{ msg: 'Failed to create folder.' }],
      'back'
    );
  }
}

async function postEditName(req, res) {
  const { name } = req.body;
  const { id } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return redirectErrorForm(req, res, errors.array(), 'back', { name }, true);
  }

  const folderId = id ? Number.parseInt(id) : null;

  try {
    await Folder.update(folderId, req.user.id, { name });

    return redirectSuccess(req, res, [{ msg: 'Folder name updated.' }], 'back');
  } catch (err) {
    console.error('Failed to edit folder name:', err);
    return redirectErrorForm(
      req,
      res,
      [{ msg: 'Failed to edit folder name.' }],
      'back',
      { name },
      true
    );
  }
}
async function postEditLocation(req, res) {
  const { parentId } = req.body;
  const { id } = req.params;

  const normalizedParentId = parentId ? Number.parseInt(parentId) : null;
  const folderId = id ? Number.parseInt(id) : null;

  try {
    await Folder.update(folderId, req.user.id, {
      parentId: normalizedParentId,
    });

    return redirectSuccess(
      req,
      res,
      [{ msg: 'Folder location updated.' }],
      'back'
    );
  } catch (err) {
    console.error('Failed to update folder location:', err);
    return redirectErrorForm(
      req,
      res,
      [{ msg: 'Failed to update folder location.' }],
      'back',
      { parentId },
      true
    );
  }
}
async function postEditFavorite(req, res) {
  const { id } = req.params;
  const folderId = id ? Number.parseInt(id) : null;

  try {
    const folder = await Folder.findById(folderId, req.user.id);
    const isFavorite = !folder.favorite;
    await Folder.update(folderId, req.user.id, { favorite: isFavorite });

    const flashMsg =
      isFavorite ?
        'Folder added to favorites.'
      : 'Folder removed from favorites.';
    return redirectSuccess(req, res, [{ msg: flashMsg }], 'back');
  } catch (err) {
    console.error('Failed to update folder favorite status:', err);
    return redirectErrorFlash(
      req,
      res,
      [{ msg: 'Failed to update favorite status of folder.' }],
      'back'
    );
  }
}

async function postDelete(req, res) {
  const { id } = req.params;
  const folderId = id ? Number.parseInt(id) : null;
  try {
    await Folder.delete(folderId, req.user.id);

    return redirectSuccess(req, res, [{ msg: 'Folder deleted.' }], 'back');
  } catch (err) {
    console.error('Failed to delete folder:', err);
    return redirectErrorFlash(
      req,
      res,
      [{ msg: 'Failed to delete folder. Try again later.' }],
      'back'
    );
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
