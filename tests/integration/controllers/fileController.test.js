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
  getDownloadUrl: jest.fn((cloudinaryId, format, fileName) => {
    const resourceType =
      format?.startsWith('image/') ? 'image'
      : format?.startsWith('video/') ? 'video'
      : 'raw';
    return `https://res.cloudinary.com/fake-cloud/${resourceType}/upload/fl_attachment:${fileName}/file-uploader/user-files/${cloudinaryId}`;
  }),
  deleteFile: jest.fn().mockResolvedValue({ result: 'ok' }),
}));

describe('File Controller', () => {
  it('successfully uploads file', async () => {
    const agent = request.agent(app);

    // Login first
    await agent
      .post('/auth/login')
      .type('form')
      .send({ username: 'JSmith1', password: 'password' });

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
    expect(recentFiles[0].name).toBe('good-test-file.txt');
  });

  it('does not upload file when too big', async () => {
    const agent = request.agent(app);

    // Login first
    await agent
      .post('/auth/login')
      .type('form')
      .send({ username: 'JSmith1', password: 'password' });

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

  it('gets download URL', async () => {
    const agent = request.agent(app);

    // Login first
    await agent
      .post('/auth/login')
      .type('form')
      .send({ username: 'JSmith1', password: 'password' });

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

    // Get download URL
    const responseDownload = await agent.get(`/files/${newFile.id}/download`);

    expect(responseDownload.status).toBe(302);
    expect(responseDownload.headers.location).toContain('cloudinary.com');
    expect(responseDownload.headers.location).toContain(
      `attachment:${newFile.name}`
    );
    expect(responseDownload.headers.location).toContain(
      newFile.cloudinaryPublicId
    );
    expect(responseDownload.headers.location).toContain('raw');
    expect(helpers.getDownloadUrl).toHaveBeenCalledWith(
      expect.any(String),
      newFile.format,
      newFile.name
    );
  });

  it('successfully deletes file', async () => {
    const agent = request.agent(app);

    await agent
      .post('/auth/login')
      .type('form')
      .send({ username: 'JSmith1', password: 'password' });

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
    const responseDelete = await agent.post(`/files/${newFile.id}/delete`);

    expect(responseDelete.status).toBe(302);
    expect(helpers.deleteFile).toHaveBeenCalledWith(
      expect.any(String),
      newFile.format
    );

    const filesAfterDelete = await File.findRecent(1);

    expect(filesAfterDelete.length).toBeLessThan(files.length);
  });
});
