// services/userService.js
const { User } = require('../models');
const { AppError } = require('../utils/appError');

/**
 * Get user by ID
 */
exports.getUserById = async (userId) => {
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Convert to plain object to remove sensitive data
  const userObj = user.get({ plain: true });
  const { password, ...userWithoutPassword } = userObj;
  
  return userWithoutPassword;
};

/**
 * Get user profile
 */
exports.getUserProfile = async (userId) => {
  const user = await this.getUserById(userId);
  
  return {
    id: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePicture: user.profilePicture,
    isVerified: user.isVerified,
    createdAt: user.createdAt
  };
};

/**
 * Update user profile
 */
exports.updateUserProfile = async (userId, userData) => {
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  await user.update(userData);
  
  // Convert to plain object to remove sensitive data
  const userObj = user.get({ plain: true });
  const { password, ...userWithoutPassword } = userObj;
  
  return userWithoutPassword;
};