const User = require('../../../models/user');

describe('User Model', () => {
  describe('create', () => {
    it('creates new user in the database', async () => {
      const userData = {
        first: 'Connor',
        last: 'Mook',
        username: 'CMook1',
        password: 'password',
      };

      const createdUser = await User.create(userData);

      expect(createdUser).toMatchObject({
        first: 'Connor',
        last: 'Mook',
        username: 'CMook1',
        hasPic: false,
        picVersion: null,
        storageUsed: 0,
      });
      expect(createdUser.id).toBeDefined();
      expect(createdUser.password).not.toBe('password');
      expect(createdUser.createdAt).toBeDefined();
      expect(createdUser.updatedAt).toBeDefined();

      // verify it's in the database
      const dbUser = await User.findById(createdUser.id);
      expect(dbUser).toBeDefined();
    });
  });

  describe('find', () => {
    it('gets user based on username', async () => {
      const username = 'JSmith1';

      const dbUser = await User.findByUsername(username);

      expect(dbUser).toBeDefined();
      expect(dbUser).toMatchObject({
        first: 'John',
        last: 'Smith',
        username: 'JSmith1',
      });
    });

    it('gets user based on id', async () => {
      const userId = 1;

      const dbUser = await User.findById(userId);

      expect(dbUser).toBeDefined();
      expect(dbUser).toMatchObject({
        first: 'John',
        last: 'Smith',
        username: 'JSmith1',
      });
    });

    it('gets user plus all files and folders based on id', async () => {
      const userId = 1;

      const dbUser = await User.findByIdWithContent(userId);

      expect(dbUser).toBeDefined();
      expect(dbUser).toMatchObject({
        first: 'John',
        last: 'Smith',
        username: 'JSmith1',
      });
      expect(dbUser.files.length).toBeGreaterThan(0);
      expect(dbUser.folders.length).toBeGreaterThan(0);
    });
  });

  describe('update', () => {
    it('updates user in the database', async () => {
      const userId = 1;
      const profileData = {
        first: 'Chet',
        last: 'Hanks',
        hasPic: true,
      };

      await User.updateProfile(userId, profileData);

      const dbUser = await User.findById(userId);

      expect(dbUser).toMatchObject({
        id: userId,
        first: 'Chet',
        last: 'Hanks',
        username: 'JSmith1',
        hasPic: true,
      });
    });
  });

  describe('delete', () => {
    it('deletes user from the database', async () => {
      const userId = 1;

      await User.delete(userId);

      const dbUser = await User.findById(userId);

      expect(dbUser).toBeFalsy();
    });
  });
});
