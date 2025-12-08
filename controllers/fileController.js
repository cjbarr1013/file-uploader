const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const {
  uploadFileBuffer,
  getDownloadUrl,
  deleteFile,
  redirectError,
  redirectSuccess,
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

async function getRecent(req, res) {
  try {
    const files = await File.findRecent(req.user.id);
    return res.status(200).json({
      layout: 'main',
      page: 'recent',
      title: 'Recent files',
      files,
    });
  } catch (err) {
    console.error('Failed to fetch recent files:', err);
    return redirectError(
      req,
      res,
      [{ msg: 'Unable to load recent files. Please try again later.' }],
      '/'
    );
  }
}

async function postUpload(req, res) {
  const { upload, parentId } = req.body;
  const normalizedParentId = parentId ? Number.parseInt(parentId) : null;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return redirectError(
      req,
      res,
      errors.array(),
      'back',
      { upload, parentId },
      true
    );
  }

  const cloudinaryPublicId = crypto.randomUUID();

  try {
    try {
      await uploadFileBuffer(
        req.file.buffer,
        cloudinaryPublicId,
        req.file.mimetype
      );
    } catch (err) {
      // handle upload failure
      console.error('Failed to upload file:', err);
      return redirectError(
        req,
        res,
        [{ msg: 'Upload failed. Please try again.' }],
        'back',
        { upload, parentId },
        true
      );
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

    return redirectSuccess(req, res, 'File successfully uploaded!', 'back');
  } catch (err) {
    console.error('Failure creating file in the database:', err);

    try {
      await deleteFile(cloudinaryPublicId, req.file.mimetype);
    } catch (cleanupErr) {
      console.error(
        'Failed to cleanup Cloudinary file after DB error:',
        cleanupErr
      );
    }

    return redirectError(
      req,
      res,
      [{ msg: 'Upload failed. Please try again.' }],
      'back',
      { upload, parentId },
      true
    );
  }
}

async function getDownload(req, res) {
  const { id } = req.params;
  const fileId = id ? Number.parseInt(id) : null;

  try {
    const file = await File.findById(fileId, req.user.id);

    if (!file) {
      return redirectError(req, res, [{ msg: 'File not found' }], 'back');
    }

    const downloadUrl = getDownloadUrl(
      file.cloudinaryPublicId,
      file.format,
      file.name
    );

    return res.redirect(downloadUrl);
  } catch (err) {
    console.error('File failed to download', err);
    return redirectError(
      req,
      res,
      [{ msg: 'There was an error downloading the file.' }],
      'back'
    );
  }
}

async function postEditName(req, res) {
  const { name } = req.body;
  const { id } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return redirectError(req, res, errors.array(), 'back');
  }

  const fileId = id ? Number.parseInt(id) : null;

  try {
    await File.update(fileId, req.user.id, { name });

    return redirectSuccess(req, res, 'File name updated successfully.', 'back');
  } catch (err) {
    console.error('Failed to change file name', err);
    return redirectError(
      req,
      res,
      [{ msg: 'There was an error editing the file name.' }],
      'back'
    );
  }
}

async function postEditLocation(req, res) {
  const { parentId } = req.body;
  const { id } = req.params;

  const normalizedParentId = parentId ? Number.parseInt(parentId) : null;
  const fileId = id ? Number.parseInt(id) : null;

  try {
    await File.update(fileId, req.user.id, {
      folderId: normalizedParentId,
    });
    return redirectSuccess(req, res, 'Folder location updated', 'back');
  } catch (err) {
    console.error('Failed to update folder location', err);
    return redirectError(
      req,
      res,
      [{ msg: 'File location failed to update.' }],
      'back',
      {},
      true
    );
  }
}

async function postEditFavorite(req, res) {
  const { id } = req.params;
  const fileId = id ? Number.parseInt(id) : null;

  try {
    const file = await File.findById(fileId, req.user.id);
    const isFavorite = !file.favorite;

    await File.update(fileId, req.user.id, { favorite: isFavorite });

    const flashMsg =
      isFavorite ? 'File added to favorites.' : 'File removed from favorites.';
    return redirectSuccess(req, res, flashMsg, 'back');
  } catch (err) {
    console.error('Failed to update favorite status:', err);
    return redirectError(
      req,
      res,
      [{ msg: 'Failure updating favorite status.' }],
      'back'
    );
  }
}

async function postDelete(req, res) {
  const { id } = req.params;
  const fileId = id ? Number.parseInt(id) : null;

  try {
    const file = await File.findById(fileId, req.user.id);
    if (!file) {
      return redirectError(req, res, [{ msg: 'File not found' }], 'back');
    }

    try {
      await deleteFile(file.cloudinaryPublicId, file.format); // delete from Cloudinary
    } catch (err) {
      console.error('Failed to delete file from cloudinary:', err);
      return redirectError(
        req,
        res,
        [{ msg: 'Failed to delete file.' }],
        'back'
      );
    }

    await File.delete(fileId, req.user.id); // delete reference from db

    return redirectSuccess(req, res, 'File deleted successfully.', 'back');
  } catch (err) {
    console.error('Failed to delete file from database:', err);
    return redirectError(
      req,
      res,
      [{ msg: 'There was an issue deleting the file.' }],
      'back'
    );
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
