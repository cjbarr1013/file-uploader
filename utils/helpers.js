const { format } = require('date-fns');
const cloudinary = require('../config/cloudinary');

function reformatSort(sort) {
  // ACCEPTED FORMATS
  // name,ASC
  // name,DESC
  // size,ASC
  // size,DESC
  // updatedAt,ASC
  // updatedAt,DESC
  // format,ASC
  // format,DESC
  const [col, order] = sort.split(',');

  // Whitelist allowed columns
  const allowedColumns = ['name', 'size', 'updatedAt', 'format'];
  const allowedOrder = ['ASC', 'DESC'];

  const column = allowedColumns.includes(col) ? col : 'updatedAt';
  const direction =
    allowedOrder.includes(order?.toUpperCase()) ? order.toUpperCase() : 'DESC';

  // Use LOWER() for case-insensitive sorting on text columns
  const textColumns = ['name', 'format'];
  const sortColumn =
    textColumns.includes(column) ? `LOWER("${column}")` : `"${column}"`;

  return [sortColumn, direction];
}

async function uploadImageBuffer(buffer, username) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'file-uploader/user-images',
        public_id: username,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
        transformation: [{ width: 500, height: 500, crop: 'limit' }], // transform on upload to save space
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

async function uploadFileBuffer(buffer, cloudinaryId, mimetype) {
  let resourceType = 'raw';
  if (mimetype.startsWith('image/')) resourceType = 'image';
  if (mimetype.startsWith('video/')) resourceType = 'video';

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'file-uploader/user-files',
        public_id: cloudinaryId,
        resource_type: resourceType,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

function getImageUrl(username, version) {
  return cloudinary.url(`file-uploader/user-images/${username}`, {
    version, // needed to update pic when user uploads new image
    analytics: false,
    transformation: [
      { width: 200, height: 200, gravity: 'faces', crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
}

function getCloudinaryUrl(cloudinaryId, mimetype) {
  let resourceType = 'raw';
  if (mimetype?.startsWith('image/')) resourceType = 'image';
  if (mimetype?.startsWith('video/')) resourceType = 'video';

  const publicId = `file-uploader/user-files/${cloudinaryId}`;

  return cloudinary.url(publicId, {
    resource_type: resourceType,
    secure: true, // use HTTPS
  });
}

async function deleteFile(cloudinaryId, mimetype) {
  let resourceType = 'raw';
  if (mimetype?.startsWith('image/')) resourceType = 'image';
  if (mimetype?.startsWith('video/')) resourceType = 'video';

  const publicId = `file-uploader/user-files/${cloudinaryId}`;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
        invalidate: true,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

async function deleteMultipleFiles(files) {
  const grouped = {
    image: [],
    video: [],
    raw: [],
  };

  files.forEach((file) => {
    if (file.mimetype.startsWith('image/')) {
      grouped.image.push(`file-uploader/user-files/${file.cloudinaryPublicId}`);
    } else if (file.mimetype.startsWith('video/')) {
      grouped.video.push(`file-uploader/user-files/${file.cloudinaryPublicId}`);
    } else {
      grouped.raw.push(`file-uploader/user-files/${file.cloudinaryPublicId}`);
    }
  });
  // delete files in parallel
  const promises = [];
  for (const [type, ids] of Object.entries(grouped)) {
    if (ids.length > 0) {
      // Handle batches of 100
      for (let i = 0; i < ids.length; i += 100) {
        const batch = ids.slice(i, i + 100);
        promises.push(
          new Promise((resolve, reject) => {
            cloudinary.api.delete_resources(
              batch,
              {
                resource_type: type,
                invalidate: true,
              },
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              }
            );
          })
        );
      }
    }
  }
  await Promise.all(promises);
}

function redirectErrorFlash(
  req,
  res,
  errors, // must be in form [{msg: ''}] (default for express-validator)
  path
) {
  req.flash('flashErrors', errors);
  return res.redirect(path);
}

function redirectErrorForm(
  req,
  res,
  errors, // must be in form [{msg: ''}] (default for express-validator)
  path,
  formData = null,
  modalId = null
) {
  req.flash('formErrors', errors);
  if (formData) req.flash('formData', formData);
  if (modalId) req.flash('showModal', modalId);
  return res.redirect(path);
}

function redirectSuccess(
  req,
  res,
  success, // must be in form [{msg: ''}] (default for express-validator)
  path
) {
  req.flash('success', success);
  return res.redirect(path);
}

function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy');
}

function truncateString(str, maxLength = 20) {
  return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
}

function normalizeId(id) {
  // no ID returns null, which represents the root folder (home)
  return id ? Number.parseInt(id) : null;
}

module.exports = {
  reformatSort,
  uploadImageBuffer,
  uploadFileBuffer,
  getImageUrl,
  getCloudinaryUrl,
  deleteFile,
  deleteMultipleFiles,
  redirectErrorFlash,
  redirectErrorForm,
  redirectSuccess,
  formatDate,
  truncateString,
  normalizeId,
};
