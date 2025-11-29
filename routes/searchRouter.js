const { Router } = require('express');
const itemsController = require('../controllers/itemsController');
const { isAuthRoute } = require('../middleware/auth');
const searchRouter = Router();

// routes
searchRouter.get('/', isAuthRoute, itemsController.getSearch);

module.exports = searchRouter;
