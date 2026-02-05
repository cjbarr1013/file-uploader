const { validationResult } = require('express-validator');
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
    return res.render('pages/main', {
      layout: 'layouts/dashboard',
      currentPage: 'home',
      title: 'Home',
      folder: {},
      breadcrumb: null,
      items,
    });
  } catch (err) {
    return next(err);
  }
}

async function getFolder(req, res) {
  const { id } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return redirectErrorFlash(req, res, errors.array(), '/');
  }

  try {
    const folderId = id ? Number.parseInt(id) : null;
    const folder = await Folder.findById(folderId, req.user.id);
    if (!folder) {
      return redirectErrorFlash(req, res, [{ msg: 'Folder not found' }], '/');
    }

    const breadcrumb = await Folder.findByIdWithBreadcrumbs(
      folderId,
      req.user.id
    );

    const items = await Items.findContentByFolderId(
      req.user.id,
      folderId,
      req.user.sortPreference
    );

    return res.render('pages/main', {
      layout: 'layouts/dashboard',
      currentPage: 'folder',
      title: folder.name,
      folder: {
        id: folderId,
        name: folder.name,
        type: 'folder',
        favorite: folder.favorite,
      },
      breadcrumb,
      breadcrumbTitle: folder.name,
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
    return res.render('pages/main', {
      layout: 'layouts/dashboard',
      currentPage: 'favorites',
      title: 'Favorites',
      folder: {},
      breadcrumb: [],
      breadcrumbTitle: 'Favorites',
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
    return res.render('pages/main', {
      layout: 'layouts/dashboard',
      currentPage: 'search',
      title: `Search Results for: ${req.query.q}`,
      folder: {},
      breadcrumb: [],
      breadcrumbTitle: 'Search Results',
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
