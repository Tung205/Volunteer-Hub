/**
 * Middleware để validate request data với Joi schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} source - Nguồn data cần validate: 'body' | 'query' | 'params'
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    const { error, value } = schema.validate(dataToValidate, { 
      abortEarly: false,  // Trả về tất cả errors, không dừng ở error đầu tiên
      stripUnknown: true  // Loại bỏ các fields không có trong schema
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        details: errors
      });
    }

    // Gán validated value vào req để controller dùng
    req[source] = value;
    next();
  };
};
