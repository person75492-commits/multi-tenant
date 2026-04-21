const { body, param, query } = require('express-validator');

exports.createTaskRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be under 1000 characters'),
];

exports.updateTaskRules = [
  param('id')
    .isMongoId().withMessage('Invalid task ID'),

  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be under 1000 characters'),

  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed']).withMessage('Status must be pending, in_progress or completed'),

  body('assignee')
    .optional()
    .isMongoId().withMessage('Invalid assignee ID'),
];

exports.mongoIdParam = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
];

exports.listTaskRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100')
    .toInt(),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('search must be under 100 characters'),
];
