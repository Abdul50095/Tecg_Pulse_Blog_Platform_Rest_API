const { validationResult } = require('express-validator');

// Sits after the express-validator rule chains on a route.
// If any rule failed, it short-circuits with a 400 instead of hitting the controller.
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
