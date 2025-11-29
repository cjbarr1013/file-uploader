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
    req.flash(
      'errorFlash',
      'You must log out before attempting to access this page.'
    );
    return res.status(401).redirect('/');
  }
}

function isNotAuthAction(req, res, next) {
  if (!req.isAuthenticated()) {
    next();
  } else {
    req.flash('errorFlash', 'You must be logged out to complete this action.');
    return res.status(401).redirect('/');
  }
}

module.exports = {
  isAuthRoute,
  isAuthAction,
  isNotAuthRoute,
  isNotAuthAction,
};
