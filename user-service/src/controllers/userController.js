const {
    getUserProfile,
    updateUserProfile,
  } = require('../services/userService');
  const { AppError } = require('../utils/appError');
  
  /**
   * Get user profile
   */
  exports.getProfile = async (req, res, next) => {
    try {
      const userId = req.params.userId;
      
      if (!userId) {
        throw new AppError('User ID is required', 400);
      }
      
      // Ensure user can only access their own profile
      if (req.user.id !== userId) {
        throw new AppError('Unauthorized', 403);
      }
      
      const user = await getUserProfile(userId);
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Update user profile
   */
  exports.updateProfile = async (req, res, next) => {
    try {
      const userId = req.params.userId;
      
      if (!userId) {
        throw new AppError('User ID is required', 400);
      }
      
      // Ensure user can only update their own profile
      if (req.user.id !== userId) {
        throw new AppError('Unauthorized', 403);
      }
      
      const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        profilePicture: req.body.profilePicture
      };
      
      const updatedUser = await updateUserProfile(userId, userData);
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  };
  
  