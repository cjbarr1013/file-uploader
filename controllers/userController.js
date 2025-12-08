const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const {
  uploadImageBuffer,
  redirectError,
  redirectSuccess,
} = require('../utils/helpers');

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

async function postRegister(req, res) {
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
        console.error('Auto-login failed after registration:', err);
        return redirectSuccess(
          req,
          res,
          'Account created successfully! Please log in to continue.',
          '/auth/login'
        );
      }
      return res.redirect('/');
    });
  } catch (err) {
    console.error('Account creation failed:', err);
    redirectError(
      req,
      res,
      [{ msg: 'Account creation failed. Please try again later.' }],
      '/auth/register',
      { first, last, username }
    );
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
    redirectSuccess(
      req,
      res,
      'You have successfully logged out.',
      '/auth/login'
    );
  });
}

async function postEdit(req, res) {
  const { first, last, pic } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return redirectError(
      req,
      res,
      errors.array(),
      'back',
      { first, last, pic },
      true
    );
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
      } catch (err) {
        // handle upload failure
        console.error('Failed to upload profile picture:', err);
        return redirectError(
          req,
          res,
          [{ msg: 'Image upload failed. Please try again.' }],
          'back',
          { first, last, pic },
          true
        );
      }
    }

    await User.updateProfile(req.user.id, { first, last, hasPic, picVersion });
    return redirectSuccess(req, res, 'Profile updated successfully!', 'back');
  } catch (err) {
    console.error('Failed to update profile:', err);
    return redirectError(
      req,
      res,
      [
        {
          msg: 'There was an issue updating your profile. Please try again later.',
        },
      ],
      'back',
      { first, last, pic },
      true
    );
  }
}

async function postDelete(req, res, next) {
  try {
    await User.delete(req.user.id);

    req.logout((err) => {
      if (err) {
        return next(err);
      }
      return redirectSuccess(
        req,
        res,
        'Your account has successfully been deleted.',
        '/auth/login'
      );
    });
  } catch (err) {
    console.error('Failed to delete account:', err);
    return redirectError(
      req,
      res,
      [
        {
          msg: 'There was an issue deleting your account. Please try again later.',
        },
      ],
      'back'
    );
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
