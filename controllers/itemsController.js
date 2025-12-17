const Items = require('../models/items');
const Folder = require('../models/folder');
const { redirectErrorFlash } = require('../utils/helpers');

async function getHome(req, res, next) {
  try {
    const items = await Items.findContentByFolderId(
      req.user.id,
      null,
      req.user.sortPreference
    );
    return res.status(200).json({
      layout: 'main',
      page: 'folder',
      title: 'Home',
      breadcrumbs: null,
      items,
    });
  } catch (err) {
    return next(err);
  }
}

async function getFolder(req, res) {
  const { id } = req.params;
  const folderId = id ? Number.parseInt(id) : null;
  try {
    const folder = await Folder.findByIdWithBreadcrumbs(folderId, req.user.id);
    if (!folder) {
      return redirectErrorFlash(
        req,
        res,
        [{ msg: 'Folder not found' }],
        'back'
      );
    }

    const items = await Items.findContentByFolderId(
      req.user.id,
      folderId,
      req.user.sortPreference
    );

    return res.status(200).json({
      layout: 'main',
      page: 'folder',
      title: folder.name,
      breadcrumbs: folder.parent,
      items,
    });
  } catch (err) {
    console.error('Failed to fetch folder content:', err);
    return redirectErrorFlash(
      req,
      res,
      [{ msg: 'Unable to load folder content. Please try again later.' }],
      '/'
    );
  }
}

async function getFavorites(req, res) {
  try {
    const items = await Items.findUserFavorites(
      req.user.id,
      req.user.sortPreference
    );
    return res.status(200).json({
      layout: 'main',
      page: 'favorites',
      title: 'Favorites',
      items,
    });
  } catch (err) {
    console.error('Failed to fetch favorites:', err);
    return redirectErrorFlash(
      req,
      res,
      [{ msg: 'Unable to load favorites. Please try again later.' }],
      '/'
    );
  }
}

async function getSearch(req, res) {
  try {
    const items = await Items.findSearchResults(
      req.user.id,
      req.query.q,
      req.user.sortPreference
    );
    return res.status(200).json({
      layout: 'main',
      page: 'search',
      title: `Search Results for: ${req.query.q}`,
      items,
    });
  } catch (err) {
    console.error('Failed to fetch search results:', err);
    return redirectErrorFlash(
      req,
      res,
      [{ msg: 'Unable to load search results. Please try again later.' }],
      '/'
    );
  }
}

module.exports = {
  getHome,
  getFolder,
  getFavorites,
  getSearch,
};
