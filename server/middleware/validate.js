/**
 * Request-validation helper.
 * Returns a middleware that checks for the presence of required body fields.
 *
 * Usage:
 *   router.post('/items', validate(['title', 'description']), handler);
 */
function validate(requiredFields = []) {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Missing required fields: ${missing.join(', ')}`,
          fields: missing,
        },
      });
    }

    next();
  };
}

module.exports = validate;
