/**
 * Global error handler
 */
exports.errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    
    // Prisma error handling
    if (err.code && err.code.startsWith('P')) {
      if (err.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'A record with this value already exists',
          error: 'DUPLICATE_ENTRY'
        });
      }
    }
    
    res.status(statusCode).json({
      success: false,
      message: message,
      error: err.name || 'SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
  };
  
  