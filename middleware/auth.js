function isAuthAction(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    const err = new Error('You are not authorized to complete this action.');
    err.statusCode = 401;
    next(err);
  }
}

function isAuthRoute(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('errors', [{ msg: 'You must be logged in to visit this page.' }]);
    return res.status(401).redirect('/auth/login');
  }
}

function isNotAuthRoute(req, res, next) {
  if (!req.isAuthenticated()) {
    next();
  } else {
    req.flash('errors', [
      { msg: 'You must log out before attempting to access this page.' },
    ]);
    return res.status(401).redirect('/');
  }
}

function isNotAuthAction(req, res, next) {
  if (!req.isAuthenticated()) {
    next();
  } else {
    req.flash('errors', [{ msg: 'You must log out to complete this action.' }]);
    return res.status(401).redirect('/');
  }
}

module.exports = {
  isAuthRoute,
  isAuthAction,
  isNotAuthRoute,
  isNotAuthAction,
};
