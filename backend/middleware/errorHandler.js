// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err);

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.keys(err.errors).map((field) => ({
      field,
      message: err.errors[field].message,
      value: err.errors[field].value
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return res.status(409).json({ success: false, message: `Duplicate value for: ${fields.join(', ')}`, fields });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    details: err.details || null
  });
};
