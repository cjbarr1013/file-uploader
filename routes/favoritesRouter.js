const { Router } = require('express');
const itemsController = require('../controllers/itemsController');
const { isAuthRoute } = require('../middleware/auth');
const favoritesRouter = Router();

// routes
favoritesRouter.get('/', isAuthRoute, itemsController.getFavorites);

module.exports = favoritesRouter;
