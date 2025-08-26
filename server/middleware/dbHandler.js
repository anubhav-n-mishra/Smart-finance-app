import mongoose from 'mongoose';

// Middleware to check database connection before processing requests
export const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please try again later.',
      error: 'DB_CONNECTION_ERROR'
    });
  }
  next();
};

// Wrapper function to handle database operations
export const handleDbOperation = async (operation, res, errorMessage = 'Database operation failed') => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again later.',
        error: 'DB_CONNECTION_ERROR'
      });
    }
    
    const result = await operation();
    return result;
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
};
