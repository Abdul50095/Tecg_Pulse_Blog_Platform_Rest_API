// Catches anything passed to next(err) from a controller, plus any error
// thrown inside an async route that isn't caught locally.
// This must be registered LAST in server.js, after all routes.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Invalid MongoDB ObjectId (e.g. GET /api/posts/not-a-real-id)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Duplicate key error (e.g. registering with an email that already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} '${err.keyValue[field]}' is already in use`,
    });
  }

  // Mongoose schema-level validation error (fallback in case something
  // slips past express-validator, e.g. a bad update via findByIdAndUpdate)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Fallback for anything unexpected
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
