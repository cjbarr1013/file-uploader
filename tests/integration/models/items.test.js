const Items = require('../../../models/items');
const { isDescending, isAscending } = require('../../helpers/helpers');

describe('Items model', () => {
  describe('find', () => {
    it('gets user favorites in correct order', async () => {
      const userId = 1;
      const sortMethod = 'size,DESC';

      const favorites = await Items.findUserFavorites(userId, sortMethod);

      expect(favorites.length).toBe(8);
      favorites.forEach((item) => {
        expect(item.favorite).toBeTruthy();
      });
      expect(isDescending(favorites.map((i) => i.size))).toBeTruthy();
    });

    it('gets all search results in correct order', async () => {
      const userId = 1;
      const sortMethod = 'format,ASC';
      const searchTerm = 'subsub';

      const searchResults = await Items.findSearchResults(
        userId,
        searchTerm,
        sortMethod
      );

      expect(searchResults.length).toBe(5);
      searchResults.forEach((item) => {
        expect(item.name.includes(searchTerm)).toBeTruthy();
      });
      expect(isAscending(searchResults.map((i) => i.format))).toBeTruthy();
    });

    it('gets folder content in correct order', async () => {
      const userId = 1;
      const sortMethod = 'name,ASC';
      const folderId = 2;

      const folderContent = await Items.findContentByFolderId(
        userId,
        folderId,
        sortMethod
      );

      expect(folderContent.length).toBe(4);
      folderContent.forEach((item) => {
        expect(item.parentId).toBe(folderId);
      });
      expect(isAscending(folderContent.map((i) => i.name))).toBeTruthy();
    });
  });
});
