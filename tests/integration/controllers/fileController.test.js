// tests/integration/fileController.test.js
const request = require('supertest');
const app = require('../../../app');
const path = require('path');
const File = require('../../../models/file');
const helpers = require('../../../utils/helpers');

jest.mock('../../../utils/helpers', () => ({
  ...jest.requireActual('../../../utils/helpers'),
  uploadFileBuffer: jest.fn().mockResolvedValue({
    public_id: 'file-uploader/user-files/123',
    secure_url: 'https://res.cloudinary.com/fake/file.txt',
    bytes: 1024,
  }),
  getCloudinaryUrl: jest.fn((cloudinaryId, mimetype) => {
    const resourceType =
      mimetype?.startsWith('image/') ? 'image'
      : mimetype?.startsWith('video/') ? 'video'
      : 'raw';
    return `https://res.cloudinary.com/fake-cloud/${resourceType}/upload/file-uploader/user-files/${cloudinaryId}`;
  }),
  deleteFile: jest.fn().mockResolvedValue({ result: 'ok' }),
}));

// Mock fetch for download test
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(Buffer.from('fake file content')),
  })
);

describe('File Controller', () => {
  it('successfully uploads file', async () => {
    const agent = request.agent(app);

    // Login first
    await agent
      .post('/auth/login')
      .type('form')
      .send({ username: 'jsmith1', password: 'password' });

    // Upload file
    const response = await agent
      .post('/files/upload')
      .field('parentId', '1')
      .attach(
        'upload',
        path.join(__dirname, '../../fixtures/good-test-file.txt')
      );

    expect(response.status).toBe(302);

    expect(helpers.uploadFileBuffer).toHaveBeenCalledTimes(1);

    expect(helpers.uploadFileBuffer).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.any(String),
      'text/plain'
    );

    const recentFiles = await File.findRecent(1);
    expect(recentFiles[0].name).toBe('good-test-file');
  });

  it('does not upload file when too big', async () => {
    const agent = request.agent(app);

    // Login first
    await agent
      .post('/auth/login')
      .type('form')
      .send({ username: 'jsmith1', password: 'password' });

    const filesBefore = await File.findRecent(1);

    // Upload image
    const response = await agent
      .post('/files/upload')
      .field('parentId', '1')
      .attach(
        'upload',
        path.join(__dirname, '../../fixtures/too-big-test-image.jpg')
      );

    expect(response.status).toBe(302);

    // Verify Cloudinary was NOT called
    expect(helpers.uploadFileBuffer).not.toHaveBeenCalled();

    // Verify no new file was created
    const filesAfter = await File.findRecent(1);
    expect(filesAfter.length).toBe(filesBefore.length);
  });

  it('does not upload file when storage quota is exceeded', async () => {
    const agent = request.agent(app);

    // Login first
    await agent
      .post('/auth/login')
      .type('form')
      .send({ username: 'CSmith1', password: 'password' });

    const filesBefore = await File.findRecent(2);

    // Upload file
    const response = await agent
      .post('/files/upload')
      .attach(
        'upload',
        path.join(__dirname, '../../fixtures/good-test-file.txt')
      );

    expect(response.status).toBe(302);

    // Verify Cloudinary was NOT called
    expect(helpers.uploadFileBuffer).not.toHaveBeenCalled();

    // Verify no new file was created
    const filesAfter = await File.findRecent(2);
    expect(filesAfter.length).toBe(filesBefore.length);
  });

  it('downloads file', async () => {
    const agent = request.agent(app);

    // Login first
    await agent
      .post('/auth/login')
      .type('form')
      .send({ username: 'jsmith1', password: 'password' });

    // Upload file
    const responseUpload = await agent
      .post('/files/upload')
      .field('parentId', '1')
      .attach(
        'upload',
        path.join(__dirname, '../../fixtures/good-test-file2.txt')
      );

    expect(responseUpload.status).toBe(302);

    const files = await File.findRecent(1);
    const newFile = files[0];

    // Download file
    const responseDownload = await agent.get(`/files/${newFile.id}/download`);

    expect(responseDownload.status).toBe(200);
    expect(responseDownload.headers['content-disposition']).toBe(
      `attachment; filename="${newFile.name}.${newFile.format}"`
    );
    expect(responseDownload.headers['content-type']).toBe(newFile.mimetype);
    expect(responseDownload.body).toBeDefined();
    expect(helpers.getCloudinaryUrl).toHaveBeenCalledWith(
      newFile.cloudinaryPublicId,
      newFile.mimetype
    );
  });

  it('successfully deletes file', async () => {
    const agent = request.agent(app);

    await agent
      .post('/auth/login')
      .type('form')
      .send({ username: 'jsmith1', password: 'password' });

    // First upload a file
    const responseUpload = await agent
      .post('/files/upload')
      .field('parentId', '1')
      .attach(
        'upload',
        path.join(__dirname, '../../fixtures/good-test-file.txt')
      );

    expect(responseUpload.status).toBe(302);

    const files = await File.findRecent(1);
    const newFile = files[0];

    // Delete it
    const responseDelete = await agent
      .post(`/files/${newFile.id}/delete`)
      .type('form')
      .send({});

    expect(responseDelete.status).toBe(302);
    expect(helpers.deleteFile).toHaveBeenCalledWith(
      expect.any(String),
      newFile.mimetype
    );

    const filesAfterDelete = await File.findRecent(1);

    expect(filesAfterDelete.length).toBeLessThan(files.length);
  });
});
