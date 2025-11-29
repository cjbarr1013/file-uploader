const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const { uploadImageBuffer } = require('../utils/helpers');

const validateFirstAndLast = [
  body('first')
    .trim()
    .notEmpty()
    .withMessage('You must enter a first name.')
    .bail()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters.'),
  body('last')
    .trim()
    .notEmpty()
    .withMessage('You must enter a last name.')
    .bail()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters.'),
];

const validateUsernameAndPassword = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('You must enter a username.')
    .bail()
    .matches(/^[0-9A-Za-z]{6,16}$/)
    .withMessage(
      'Username must be between 6 and 16 characters and only contain letters and numbers'
    )
    .bail()
    .custom(async (value) => {
      const user = await User.findByUsername(value);
      if (user) {
        throw new Error('Username is already in use.');
      }
    }),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('You must enter a password.')
    .bail()
    .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$/)
    .withMessage(
      'Password must be between 8 and 32 characters, have one uppercase letter, one lowercase letter, one digit and one special character.'
    ),
  body('passwordVerify')
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
];

function getRegister(req, res) {
  // TODO: render template/page instead of json
  return res.status(200).json({
    layout: 'auth',
    page: 'register',
    title: 'Register',
  });
}

async function postRegister(req, res, next) {
  const { first, last, username, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // TODO: render template/page instead of json
    return res.status(400).json({
      layout: 'auth',
      page: 'register',
      title: 'Register',
      errors: errors.array(),
      formData: { first, last, username },
    });
  }

  try {
    const user = await User.create({ first, last, username, password });
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  } catch (err) {
    next(err);
  }
}

function getLogin(req, res) {
  const attemptedUsername = req.session.attemptedUsername || '';
  delete req.session.attemptedUsername;

  // TODO: render template/page instead of json
  return res.status(200).json({
    layout: 'auth',
    page: 'login',
    title: 'Log in',
    formData: {
      username: attemptedUsername,
    },
    flash: res.locals.flash,
  });
}

function postLogout(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success', 'You have successfully logged out.');
    return res.redirect('/auth/login');
  });
}

async function postEdit(req, res, next) {
  const { first, last, pic } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array());
    req.flash('formData', { first, last, pic });
    req.flash('showModal', true);
    return res.redirect('back');
  }

  try {
    let hasPic = req.user.hasPic;
    let picVersion = req.user.picVersion;

    if (req.file) {
      try {
        const result = await uploadImageBuffer(
          req.file.buffer,
          req.user.username
        );
        hasPic = true;
        picVersion = result?.version || null;
      } catch {
        // handle upload failure
        req.flash('errors', [
          { msg: 'Image upload failed. Please try again.' },
        ]);
        req.flash('formData', { first, last, pic });
        req.flash('showModal', true);
        return res.redirect('back');
      }
    }

    await User.updateProfile(req.user.id, { first, last, hasPic, picVersion });
    req.flash('success', 'Profile updated successfully!');
    return res.redirect('back');
  } catch (err) {
    return next(err);
  }
}

async function postDelete(req, res, next) {
  try {
    await User.delete(req.user.id);

    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.flash('success', 'Your account has successfully been deleted.');
      return res.redirect('/auth/login');
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  validateFirstAndLast,
  validateUsernameAndPassword,
  getRegister,
  postRegister,
  getLogin,
  postLogout,
  postEdit,
  postDelete,
};
