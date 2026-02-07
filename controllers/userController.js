const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const {
  uploadImageBuffer,
  redirectErrorFlash,
  redirectErrorForm,
  redirectSuccess,
  deleteMultipleFiles,
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
  return res.render('pages/register', {
    layout: 'layouts/auth',
    title: 'Register',
  });
}

async function postRegister(req, res) {
  const { first, last, username, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return redirectErrorForm(req, res, errors.array(), '/auth/register', {
      first,
      last,
      username,
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
          [{ msg: 'Account created successfully! Please log in to continue.' }],
          '/auth/login'
        );
      }
      return res.redirect('/');
    });
  } catch (err) {
    console.error('Account creation failed:', err);
    redirectErrorForm(
      req,
      res,
      [{ msg: 'Account creation failed. Please try again later.' }],
      '/auth/register',
      { first, last, username }
    );
  }
}

function getLogin(req, res) {
  return res.render('pages/log-in', {
    layout: 'layouts/auth',
    title: 'Log in',
  });
}

function postLogin(req, res, next) {
  // checks local strategy in passport config, then runs this callback
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return redirectErrorForm(
        req,
        res,
        [{ msg: info.message }],
        '/auth/login',
        { username: req.body.username }
      );
    }
    // Authentication succeeded - log the user in
    req.login(user, (err) => {
      if (err) {
        return redirectErrorForm(
          req,
          res,
          [{ msg: 'Log in failed. Please try again later.' }],
          '/auth/login',
          { username: req.body.username }
        );
      }
      return redirectSuccess(req, res, [{ msg: info.message }], '/');
    });
  })(req, res, next); // needed to immediately invoke passport.authenticate middleware
}

function postLogout(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    redirectSuccess(
      req,
      res,
      [{ msg: 'You have successfully logged out.' }],
      '/auth/login'
    );
  });
}

async function postEdit(req, res) {
  const { first, last, pic } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return redirectErrorForm(
      req,
      res,
      errors.array(),
      req.body.returnTo || '/',
      { first, last, pic },
      'edit-profile-modal'
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
        return redirectErrorForm(
          req,
          res,
          [{ msg: 'Image upload failed. Please try again.' }],
          req.body.returnTo || '/',
          { first, last, pic },
          'edit-profile-modal'
        );
      }
    }

    await User.updateProfile(req.user.id, { first, last, hasPic, picVersion });
    return redirectSuccess(
      req,
      res,
      [{ msg: 'Profile updated successfully!' }],
      req.body.returnTo || '/'
    );
  } catch (err) {
    console.error('Failed to update profile:', err);
    return redirectErrorForm(
      req,
      res,
      [
        {
          msg: 'There was an issue updating your profile. Please try again later.',
        },
      ],
      req.body.returnTo || '/',
      { first, last, pic },
      'edit-profile-modal'
    );
  }
}

async function postDelete(req, res, next) {
  try {
    try {
      const { files } = await User.findByIdWithContent(req.user.id);
      await deleteMultipleFiles(files);
    } catch (err) {
      console.error(
        `Failed to delete files associated with user ID ${req.user.id}`,
        err
      );
    }

    await User.delete(req.user.id);

    req.logout((err) => {
      if (err) {
        return next(err);
      }
      return redirectSuccess(
        req,
        res,
        [{ msg: 'Your account has successfully been deleted.' }],
        '/auth/login'
      );
    });
  } catch (err) {
    console.error('Failed to delete account:', err);
    return redirectErrorFlash(
      req,
      res,
      [
        {
          msg: 'There was an issue deleting your account. Please try again later.',
        },
      ],
      'back' // req.body.returnTo || '/' when hidden form implemented
    );
  }
}

async function postSortPreference(req, res) {
  try {
    await User.updateProfile(req.user.id, {
      sortPreference: req.body.sortPreference,
    });
    return res.redirect(req.body.returnTo || '/');
  } catch {
    return redirectErrorFlash(
      req,
      res,
      [
        {
          msg: 'That action could not be completed. Please try again later.',
        },
      ],
      req.body.returnTo || '/'
    );
  }
}

module.exports = {
  validateFirstAndLast,
  validateUsernameAndPassword,
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  postLogout,
  postEdit,
  postDelete,
  postSortPreference,
};
