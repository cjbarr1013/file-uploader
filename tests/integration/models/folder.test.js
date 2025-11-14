const Folder = require('../../../models/folder');
const User = require('../../../models/user');

describe('Folder Model', () => {
  describe('create', () => {
    it('creates new folder in the database', async () => {
      const folderData = {
        name: 'newFolder',
        creatorId: 1,
      };

      const createdFolder = await Folder.create(folderData);

      expect(createdFolder).toMatchObject({
        name: 'newFolder',
        favorite: false,
        creatorId: 1,
      });

      expect(createdFolder.id).toBeDefined();
      expect(createdFolder.createdAt).toBeDefined();
      expect(createdFolder.updatedAt).toBeDefined();

      // verify it's in the database
      const dbFolder = await Folder.findById(createdFolder.id);
      expect(dbFolder).toBeDefined();
    });
  });

  describe('find', () => {
    it('gets folder based on id', async () => {
      const folderId = 1;

      const dbFolder = await Folder.findById(folderId);

      expect(dbFolder).toBeDefined();
      expect(dbFolder).toMatchObject({
        name: 'folder1',
        favorite: false,
        creatorId: 1,
      });
    });

    it('gets folder with parent folder info based on id', async () => {
      const folderId = 2;

      const dbFolder = await Folder.findByIdWithParent(folderId);

      expect(dbFolder).toBeDefined();
      expect(dbFolder.parent).not.toBeFalsy();
      expect(dbFolder.parent).toMatchObject({
        id: 1,
        name: 'folder1',
      });
    });

    it('gets folders plus all content based on id', async () => {
      const folderId = 2;

      const dbFolder = await Folder.findByIdWithContent(folderId);

      expect(dbFolder).toBeDefined();
      expect(dbFolder).toMatchObject({
        id: 2,
        name: 'subfolder1',
        favorite: false,
        parent: {
          id: 1,
          name: 'folder1',
        },
      });
      expect(dbFolder.subfolders.length).toBeGreaterThan(0);
      expect(dbFolder.files.length).toBeGreaterThan(0);
    });

    it('gets breadcrumbs (max 3) based on folder id', async () => {
      const folderId = 4;
      const breadcrumbs = await Folder.findByIdWithBreadcrumbs(folderId);

      expect(breadcrumbs).toMatchObject({
        id: folderId,
        name: 'subsubfolder2',
        parent: {
          id: 2,
          name: 'subfolder1',
          parent: {
            id: 1,
            name: 'folder1',
          },
        },
      });
    });
  });

  describe('update', () => {
    it('updates folder name and loc in the database', async () => {
      const folderId = 2;
      const folderData = {
        name: 'newName',
        parentId: 3,
      };

      await Folder.update(folderId, folderData);

      const dbFolder = await Folder.findById(folderId);

      expect(dbFolder).toMatchObject({
        id: folderId,
        name: 'newName',
        parentId: 3,
      });
    });
  });

  describe('delete', () => {
    it('deletes folder and its content and subtracts from storageUsed', async () => {
      const userId = 1;
      const folderId = 1;

      const userBefore = await User.findById(userId);
      const storageBefore = userBefore.storageUsed;

      await Folder.delete(folderId);

      const userAfter = await User.findById(userId);
      const storageAfter = userAfter.storageUsed;
      const deletedFolder = await Folder.findById(folderId);

      expect(deletedFolder).toBeFalsy();
      expect(storageBefore).toBeGreaterThan(storageAfter);
      expect(storageAfter).toBe(6033);
    });
  });
});
