const { validationResult } = require('express-validator');

/**
 * Reads express-validator results and short-circuits with a 422
 * if any rule failed. Returns structured field-level errors.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 'fail',
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
