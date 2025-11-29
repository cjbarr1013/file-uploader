const { Router } = require('express');
const itemsController = require('../controllers/itemsController');
const { isAuthRoute } = require('../middleware/auth');
const indexRouter = Router();

// routes
indexRouter.get('/', isAuthRoute, itemsController.getHome);

module.exports = indexRouter;
