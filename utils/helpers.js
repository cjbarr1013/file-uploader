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

  return [`"${column}"`, direction];
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

function getDownloadUrl(cloudinaryId, mimetype, fileName) {
  let resourceType = 'raw';
  if (mimetype?.startsWith('image/')) resourceType = 'image';
  if (mimetype?.startsWith('video/')) resourceType = 'video';

  const publicId = `file-uploader/user-files/${cloudinaryId}`;

  return cloudinary.url(publicId, {
    resource_type: resourceType,
    flags: `attachment:${fileName}`, // set custom filename
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

module.exports = {
  reformatSort,
  uploadImageBuffer,
  uploadFileBuffer,
  getDownloadUrl,
  deleteFile,
};
