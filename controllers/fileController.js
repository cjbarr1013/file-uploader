const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const {
  uploadFileBuffer,
  getDownloadUrl,
  deleteFile,
} = require('../utils/helpers');
const File = require('../models/file');

const validateUpload = [
  body('upload').custom((value, { req }) => {
    // Check if file exists
    if (!req.file) {
      throw new Error('Please select a file to upload.');
    }

    const storageQuota = BigInt(process.env.STORAGE_QUOTA_BYTES);
    const newStorageTotal = BigInt(req.file.size) + req.user.storageUsed;

    if (newStorageTotal > storageQuota) {
      const availableSpace = storageQuota - req.user.storageUsed;
      throw new Error(
        `Upload exceeds storage quota. You have ${Number(availableSpace)} bytes remaining.`
      );
    }

    return true;
  }),
];

const validateName = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('File must have a name.')
    .bail()
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters.'),
];

async function getRecent(req, res, next) {
  try {
    const files = await File.findRecent(req.user.id);
    return res.status(400).json({
      layout: 'main',
      page: 'recent',
      title: 'Recent files',
      files,
    });
  } catch (err) {
    return next(err);
  }
}

async function postUpload(req, res, next) {
  const { upload, parentId } = req.body;
  const normalizedParentId = parentId ? Number.parseInt(parentId) : null;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array());
    req.flash('formData', { upload, parentId });
    req.flash('showModal', true);
    return res.redirect('back');
  }

  try {
    const cloudinaryPublicId = crypto.randomUUID();

    try {
      await uploadFileBuffer(
        req.file.buffer,
        cloudinaryPublicId,
        req.file.mimetype
      );
    } catch {
      // handle upload failure
      req.flash('errors', [{ msg: 'Upload failed. Please try again.' }]);
      req.flash('formData', { upload, parentId });
      req.flash('showModal', true);
      return res.redirect('back');
    }

    await File.create(
      {
        cloudinaryPublicId,
        name: req.file.originalname,
        size: req.file.size,
        format: req.file.mimetype,
        folderId: normalizedParentId,
        creatorId: req.user.id,
      },
      req.user.id
    );

    req.flash('success', 'File successfully uploaded!');
    return res.redirect('back');
  } catch (err) {
    return next(err);
  }
}

async function getDownload(req, res, next) {
  const { id } = req.params;
  const fileId = id ? Number.parseInt(id) : null;

  try {
    const file = await File.findById(fileId, req.user.id);
    if (!file) {
      req.flash('error', 'File not found.');
      return res.redirect('back');
    }

    const downloadUrl = getDownloadUrl(
      file.cloudinaryPublicId,
      file.format,
      file.name
    );
    return res.redirect(downloadUrl);
  } catch (err) {
    return next(err);
  }
}

async function postEditName(req, res, next) {
  const { name } = req.body;
  const { id } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array());
    req.flash('formData', { name });
    req.flash('showEditName', true);
    return res.redirect('back');
  }

  const fileId = id ? Number.parseInt(id) : null;

  try {
    await File.update(fileId, req.user.id, { name });
    req.flash('success', 'File name updated.');
    return res.redirect('back');
  } catch (err) {
    return next(err);
  }
}

async function postEditLocation(req, res, next) {
  const { parentId } = req.body;
  const { id } = req.params;

  const normalizedParentId = parentId ? Number.parseInt(parentId) : null;
  const fileId = id ? Number.parseInt(id) : null;

  try {
    await File.update(fileId, req.user.id, {
      folderId: normalizedParentId,
    });
    req.flash('success', 'Folder location updated.');
    return res.redirect('back');
  } catch (err) {
    return next(err);
  }
}

async function postEditFavorite(req, res, next) {
  const { id } = req.params;
  const fileId = id ? Number.parseInt(id) : null;

  try {
    const file = await File.findById(fileId, req.user.id);
    const isFavorite = !file.favorite;
    await File.update(fileId, req.user.id, { favorite: isFavorite });
    req.flash(
      'success',
      isFavorite ? 'File added to favorites.' : 'File removed from favorites.'
    );
    return res.redirect('back');
  } catch (err) {
    return next(err);
  }
}

async function postDelete(req, res, next) {
  const { id } = req.params;
  const fileId = id ? Number.parseInt(id) : null;

  try {
    const file = await File.findById(fileId, req.user.id);
    if (!file) {
      req.flash('error', 'File not found.');
      return res.redirect('back');
    }

    await deleteFile(file.cloudinaryPublicId, file.format); // delete from Cloudinary
    await File.delete(fileId, req.user.id); // delete reference from db

    req.flash('success', 'File deleted successfully.');
    return res.redirect('back');
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  validateUpload,
  validateName,
  getRecent,
  postUpload,
  getDownload,
  postEditName,
  postEditLocation,
  postEditFavorite,
  postDelete,
};
