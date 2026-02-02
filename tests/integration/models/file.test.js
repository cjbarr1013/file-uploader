const crypto = require('crypto');
const File = require('../../../models/file');
const User = require('../../../models/user');

describe('File Model', () => {
  describe('create', () => {
    it('creates new file in the database', async () => {
      const fileData = {
        cloudinaryPublicId: crypto.randomUUID(),
        name: '',
        size: 3987,
        format: 'pdf',
        mimetype: 'raw',
        creatorId: 1,
      };

      const createdFile = await File.create(fileData, 1);

      expect(createdFile).toMatchObject({
        name: '',
        size: 3987,
        format: 'pdf',
        favorite: false,
        mimetype: 'raw',
        creatorId: 1,
      });

      expect(createdFile.id).toBeDefined();
      expect(createdFile.createdAt).toBeDefined();
      expect(createdFile.updatedAt).toBeDefined();

      // verify it's in the database
      const dbFile = await File.findById(createdFile.id);
      expect(dbFile).toBeDefined();
    });
  });

  describe('find', () => {
    it('gets file based on id', async () => {
      const fileId = 1;

      const dbFile = await File.findById(fileId);

      expect(dbFile).toBeDefined();
      expect(dbFile).toMatchObject({
        name: 'subsubfile1',
        size: 32999,
        format: 'pdf',
        favorite: true,
        creatorId: 1,
      });
    });

    it('gets file with parent folder info based on id', async () => {
      const fileId = 1;

      const dbFile = await File.findByIdWithParent(fileId);

      expect(dbFile).toBeDefined();
      expect(dbFile.folder).not.toBeFalsy();
      expect(dbFile.folder).toMatchObject({
        id: 4,
        name: 'subsubfolder2',
      });
    });

    it('gets files updated within the last 30 days from user id', async () => {
      const userId = 1;

      const fortyDaysAgo = new Date();
      fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const fileData = {
        cloudinaryPublicId: crypto.randomUUID(),
        name: 'oldfile',
        size: 1000,
        format: 'pdf',
        mimetype: 'raw',
        creatorId: userId,
        updatedAt: fortyDaysAgo,
        createdAt: fortyDaysAgo,
      };

      const oldFile = await File.create(fileData, userId);
      const recentFiles = await File.findRecent(userId);
      const oldFileInResults = recentFiles.find((f) => f.id === oldFile.id);

      expect(recentFiles.length).toBeGreaterThan(0);
      expect(oldFileInResults).toBeUndefined();
      recentFiles.forEach((file) => {
        expect(file.updatedAt.getTime()).toBeGreaterThanOrEqual(
          thirtyDaysAgo.getTime()
        );
      });
    });
  });

  describe('update', () => {
    it('updates file name and loc in the database', async () => {
      const fileId = 1;
      const userId = 1;
      const fileData = {
        name: 'newName',
        folderId: 1,
      };

      await File.update(fileId, userId, fileData);

      const dbFile = await File.findById(fileId, userId);

      expect(dbFile).toMatchObject({
        id: fileId,
        name: 'newName',
        size: 32999,
        format: 'pdf',
        folderId: 1,
      });
    });
  });

  describe('delete', () => {
    it('deletes file from the database and subtracts from storageUsed', async () => {
      const userId = 1;
      const fileId = 1;

      const userBefore = await User.findById(userId);
      const storageBefore = userBefore.storageUsed;

      await File.delete(fileId, userId);

      const userAfter = await User.findById(userId);
      const storageAfter = userAfter.storageUsed;
      const deletedFile = await File.findById(fileId, userId);

      expect(deletedFile).toBeFalsy();
      expect(storageBefore).toBeGreaterThan(storageAfter);
    });
  });
});
