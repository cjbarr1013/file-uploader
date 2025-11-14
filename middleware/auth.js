function isAuthAction(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    const err = new Error('You must be signed in to complete this action.');
    err.statusCode = 401;
    next(err);
  }
}

function isAuthRoute(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.status(401).redirect('/auth/login');
  }
}

function isNotAuthRoute(req, res, next) {
  if (!req.isAuthenticated()) {
    next();
  } else {
    return res.status(401).redirect('/');
  }
}

module.exports = {
  isAuthRoute,
  isAuthAction,
  isNotAuthRoute,
};
