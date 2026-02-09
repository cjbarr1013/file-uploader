const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const {
  uploadFileBuffer,
  getCloudinaryUrl,
  deleteFile,
  redirectErrorForm,
  redirectErrorFlash,
  redirectSuccess,
  normalizeId,
  convertBytesToMB,
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
        `Upload exceeds storage quota. You have ${convertBytesToMB(availableSpace).toFixed(2)}MB remaining.`
      );
    }

    return true;
  }),
];

const validateName = [
  body('itemName')
    .trim()
    .notEmpty()
    .withMessage('File must have a name.')
    .bail()
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters.'),
];

async function getRecent(req, res) {
  try {
    const items = await File.findRecent(req.user.id);
    return res.render('pages/main', {
      layout: 'layouts/dashboard',
      currentPage: 'recent',
      title: `Updated Last 30 Days`,
      folder: {},
      breadcrumb: [],
      breadcrumbTitle: 'Recents',
      items,
    });
  } catch (err) {
    console.error('Failed to fetch recent files:', err);
    return redirectErrorFlash(
      req,
      res,
      [{ msg: 'Unable to load recent files. Please try again later.' }],
      '/'
    );
  }
}

async function postUpload(req, res) {
  const { upload, itemName, parentId } = req.body;
  const normalizedParentId = normalizeId(parentId);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return redirectErrorForm(
      req,
      res,
      errors.array(),
      req.body.returnTo || '/',
      { upload, itemName, parentId },
      'upload-file-modal'
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
      return redirectErrorForm(
        req,
        res,
        [
          {
            msg: 'Upload failed. File type may be restricted by Cloudinary. Please try again or upload a different file.',
          },
        ],
        req.body.returnTo || '/',
        { upload, itemName, parentId },
        'upload-file-modal'
      );
    }

    await File.create(
      {
        cloudinaryPublicId,
        name: itemName,
        size: req.file.size,
        format: req.file.originalname.split('.').at(-1),
        mimetype: req.file.mimetype,
        folderId: normalizedParentId,
        creatorId: req.user.id,
      },
      req.user.id
    );

    return redirectSuccess(
      req,
      res,
      [{ msg: 'File successfully uploaded!' }],
      req.body.returnTo || '/'
    );
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

    return redirectErrorForm(
      req,
      res,
      [{ msg: 'Upload failed. Please try again.' }],
      req.body.returnTo || '/',
      { upload, itemName, parentId },
      'upload-file-modal'
    );
  }
}

async function getDownload(req, res) {
  const { id } = req.params;
  const fileId = id ? Number.parseInt(id) : null;

  try {
    const file = await File.findById(fileId, req.user.id);

    if (!file) {
      return redirectErrorFlash(
        req,
        res,
        [{ msg: 'File not found.' }],
        req.query.returnTo || '/'
      );
    }

    // Get Cloudinary URL without attachment flag
    const cloudinaryUrl = getCloudinaryUrl(
      file.cloudinaryPublicId,
      file.mimetype
    );

    // Fetch file from Cloudinary
    const response = await fetch(cloudinaryUrl);
    if (!response.ok) {
      throw new Error(`Cloudinary fetch failed: ${response.status}`);
    }

    // Get the file buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    // Send with proper filename in headers
    const fullFileName = `${file.name}.${file.format}`;
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fullFileName}"`
    );
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);
  } catch (err) {
    console.error('File failed to download', err);
    return redirectErrorFlash(
      req,
      res,
      [{ msg: 'There was an error downloading the file.' }],
      req.query.returnTo || '/'
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

  const fileId = id ? Number.parseInt(id) : null;

  try {
    await File.update(fileId, req.user.id, { name: itemName });

    return redirectSuccess(
      req,
      res,
      [{ msg: 'File name updated successfully.' }],
      req.body.returnTo || '/'
    );
  } catch (err) {
    console.error('Failed to change file name', err);
    return redirectErrorForm(
      req,
      res,
      [{ msg: 'There was an error editing the file name.' }],
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
  const fileId = id ? Number.parseInt(id) : null;

  try {
    await File.update(fileId, req.user.id, {
      folderId: normalizedParentId,
    });
    return redirectSuccess(
      req,
      res,
      [{ msg: 'Folder location updated' }],
      req.body.returnTo || '/'
    );
  } catch (err) {
    console.error('Failed to update folder location', err);
    return redirectErrorForm(
      req,
      res,
      [{ msg: 'File location failed to update.' }],
      req.body.returnTo || '/',
      { parentId },
      'edit-location-modal'
    );
  }
}

async function postEditFavorite(req, res) {
  const { id } = req.params;
  const fileId = id ? Number.parseInt(id) : null;

  try {
    const file = await File.findById(fileId, req.user.id);
    const isFavorite = !file.favorite; // toggle favorite status

    await File.update(fileId, req.user.id, { favorite: isFavorite });

    const flashMsg =
      isFavorite ?
        `${file.name} added to favorites.`
      : `${file.name} removed from favorites.`;

    return redirectSuccess(
      req,
      res,
      [{ msg: flashMsg }],
      req.body.returnTo || '/'
    );
  } catch (err) {
    console.error('Failed to update favorite status:', err);
    return redirectErrorFlash(
      req,
      res,
      [{ msg: 'Failure updating favorite status.' }],
      req.body.returnTo || '/'
    );
  }
}

async function postDelete(req, res) {
  const { id } = req.params;
  const fileId = id ? Number.parseInt(id) : null;

  try {
    const file = await File.findById(fileId, req.user.id);
    if (!file) {
      return redirectErrorFlash(
        req,
        res,
        [{ msg: 'File not found' }],
        req.body.returnTo || '/'
      );
    }

    try {
      await deleteFile(file.cloudinaryPublicId, file.mimetype); // delete from Cloudinary
    } catch (err) {
      console.error('Failed to delete file from cloudinary:', err);
      return redirectErrorFlash(
        req,
        res,
        [{ msg: 'Failed to delete file.' }],
        req.body.returnTo || '/'
      );
    }

    await File.delete(fileId, req.user.id); // delete reference from db

    return redirectSuccess(
      req,
      res,
      [{ msg: 'File deleted successfully.' }],
      req.body.returnTo || '/'
    );
  } catch (err) {
    console.error('Failed to delete file from database:', err);
    return redirectErrorFlash(
      req,
      res,
      [{ msg: 'There was an issue deleting the file.' }],
      req.body.returnTo || '/'
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
