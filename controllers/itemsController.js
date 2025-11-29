const Items = require('../models/items');
const Folder = require('../models/folder');

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

async function getFolder(req, res, next) {
  const { id } = req.params;
  const folderId = id ? Number.parseInt(id) : null;
  try {
    const folder = await Folder.findByIdWithBreadcrumbs(folderId, req.user.id);
    if (!folder) return res.redirect('/');

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
    return next(err);
  }
}

async function getFavorites(req, res, next) {
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
    return next(err);
  }
}

async function getSearch(req, res, next) {
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
    return next(err);
  }
}

module.exports = {
  getHome,
  getFolder,
  getFavorites,
  getSearch,
};
