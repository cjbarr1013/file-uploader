const { body, param, validationResult } = require('express-validator');
const Folder = require('../models/folder');
const {
  deleteMultipleFiles,
  redirectErrorForm,
  redirectErrorFlash,
  redirectSuccess,
  normalizeId,
} = require('../utils/helpers');

const validateName = [
  body('itemName')
    .trim()
    .notEmpty()
    .withMessage('Folder must have a name.')
    .bail()
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters.'),
];

const validateFolderId = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Invalid folder ID.')
    .bail()
    .matches(/^\d+$/)
    .withMessage('Invalid folder ID.'),
];

async function postCreate(req, res) {
  const { itemName, parentId } = req.body;
  const errors = validationResult(req);
  const normalizedParentId = normalizeId(parentId);

  if (!errors.isEmpty()) {
    return redirectErrorForm(
      req,
      res,
      errors.array(),
      req.body.returnTo || '/',
      { itemName, parentId },
      'create-folder-modal'
    );
  }

  try {
    await Folder.create({
      name: itemName,
      parentId: normalizedParentId,
      creatorId: req.user.id,
    });

    return redirectSuccess(
      req,
      res,
      [{ msg: 'Folder created successfully!' }],
      req.body.returnTo || '/'
    );
  } catch (err) {
    console.error('Failed to create folder:', err);
    return redirectErrorFlash(
      req,
      res,
      [{ msg: 'Failed to create folder.' }],
      req.body.returnTo || '/'
    );
  }
}

async function postEditName(req, res) {
  const { itemName } = req.body;
  const { id } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return redirectErrorForm(
      req,
      res,
      errors.array(),
      req.body.returnTo || '/',
      { itemName },
      'edit-name-modal'
    );
  }

  const folderId = id ? Number.parseInt(id) : null;

  try {
    await Folder.update(folderId, req.user.id, { name: itemName });

    return redirectSuccess(
      req,
      res,
      [{ msg: 'Folder name updated.' }],
      req.body.returnTo || '/'
    );
  } catch (err) {
    console.error('Failed to edit folder name:', err);
    return redirectErrorForm(
      req,
      res,
      [{ msg: 'Failed to edit folder name.' }],
      req.body.returnTo || '/',
      { itemName },
      'edit-name-modal'
    );
  }
}
async function postEditLocation(req, res) {
  const { parentId } = req.body;
  const { id } = req.params;

  const normalizedParentId = normalizeId(parentId);
  const folderId = id ? Number.parseInt(id) : null;

  try {
    await Folder.update(folderId, req.user.id, {
      parentId: normalizedParentId,
    });

    return redirectSuccess(
      req,
      res,
      [{ msg: 'Folder location updated.' }],
      req.body.returnTo || '/'
    );
  } catch (err) {
    console.error('Failed to update folder location:', err);
    return redirectErrorForm(
      req,
      res,
      [{ msg: 'Failed to update folder location.' }],
      req.body.returnTo || '/',
      { parentId },
      'edit-location-modal'
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
        `${folder.name} added to favorites.`
      : `${folder.name} removed from favorites.`;

    return redirectSuccess(
      req,
      res,
      [{ msg: flashMsg }],
      req.body.returnTo || '/'
    );
  } catch (err) {
    console.error('Failed to update folder favorite status:', err);
    return redirectErrorFlash(
      req,
      res,
      [{ msg: 'Failed to update favorite status of folder.' }],
      req.body.returnTo || '/'
    );
  }
}

async function postDelete(req, res) {
  const { id } = req.params;
  const folderId = id ? Number.parseInt(id) : null;
  // could reverse the order of these try... catch blocks
  // this way if cloudinary fails, the files will be gone from the DB and not visible to the user
  // cloudinary
  try {
    const childFiles = await Folder.findAllChildFiles(folderId, req.user.id);
    await deleteMultipleFiles(childFiles);
  } catch (err) {
    console.error('Failure deleting folder content:', err);
    return redirectErrorFlash(
      req,
      res,
      [{ msg: 'Failed to delete folder. Try again later.' }],
      req.body.returnTo || '/'
    );
  }
  // database
  try {
    await Folder.delete(folderId, req.user.id);
    return redirectSuccess(
      req,
      res,
      [{ msg: 'Folder deleted.' }],
      req.body.returnTo || '/'
    );
  } catch (err) {
    console.error('Failed to delete folder after contents deleted:', err);
    return redirectErrorFlash(
      req,
      res,
      [{ msg: 'Failed to delete folder. Try again later.' }],
      req.body.returnTo || '/'
    );
  }
}

module.exports = {
  validateName,
  validateFolderId,
  postCreate,
  postEditName,
  postEditLocation,
  postEditFavorite,
  postDelete,
};
