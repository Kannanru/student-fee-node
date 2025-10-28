const BaseService = require('./base.service');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserService extends BaseService {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   * @param {String} email
   * @returns {Promise<Object>}
   */
  async findByEmail(email) {
    return await this.findOneByFilter({ email });
  }

  /**
   * Create new user with password hashing
   * @param {Object} userData - { name, email, password, role, ... }
   * @returns {Promise<Object>}
   */
  async createUser(userData) {
    const { password, ...rest } = userData;
    
    // Check if email already exists
    const existing = await this.findByEmail(rest.email);
    if (existing) {
      throw new Error('Email already registered');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    return await this.create({
      ...rest,
      password: hashedPassword
    });
  }

  /**
   * Verify user password
   * @param {Object} user - User document
   * @param {String} password - Plain text password
   * @returns {Promise<Boolean>}
   */
  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }

  /**
   * Get user profile (exclude sensitive data)
   * @param {String} userId
   * @returns {Promise<Object>}
   */
  async getProfile(userId) {
    return await this.findOne(userId, {
      select: '-password'
    });
  }

  /**
   * Update user profile
   * @param {String} userId
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateProfile(userId, updates) {
    // Remove password from updates if present
    const { password, ...safeUpdates } = updates;
    
    return await this.update(userId, safeUpdates, {
      new: true,
      runValidators: true,
      select: '-password'
    });
  }

  /**
   * Change user password
   * @param {String} userId
   * @param {String} oldPassword
   * @param {String} newPassword
   * @returns {Promise<Boolean>}
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.Model.findById(userId);
    if (!user) throw new Error('User not found');
    
    // Verify old password
    const isValid = await this.verifyPassword(user, oldPassword);
    if (!isValid) throw new Error('Invalid password');
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    return true;
  }

  /**
   * Authenticate user with email and password
   * @param {String} email
   * @param {String} password
   * @returns {Promise<Object>} - User object without password
   */
  async authenticate(email, password) {
    // Find user
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Verify password
    const isValid = await this.verifyPassword(user, password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    
    return userObj;
  }
}

module.exports = new UserService();
