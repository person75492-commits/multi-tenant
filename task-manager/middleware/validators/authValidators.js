const { body } = require('express-validator');

const strongPassword = body('password')
  .notEmpty().withMessage('Password is required')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
  .matches(/[a-z]/).withMessage('Must contain at least one lowercase letter')
  .matches(/[0-9]/).withMessage('Must contain at least one number')
  .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Must contain at least one special character (!@#$%^&* etc.)');

exports.registerAdminRules = [
  body('orgName').trim().notEmpty().withMessage('Organization name is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  strongPassword,
];

exports.registerMemberRules = [
  body('inviteCode').trim().notEmpty().withMessage('Invite code is required')
    .isLength({ min: 32, max: 32 }).withMessage('Invalid invite code format'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  strongPassword,
];

exports.loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];
