const bcrypt = require('bcrypt');
const authConfig = require('../config/auth');

/**
 * Hash a password
 */
exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, authConfig.passwordHash.saltRounds);
};

/**
 * Compare a password with a hash
 */
exports.comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

