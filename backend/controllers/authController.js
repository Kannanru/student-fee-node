// controllers/authController.js
const jwt = require('jsonwebtoken');
const UserService = require('../services/user.service');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Use UserService to create user (includes validation and password hashing)
    await UserService.createUser({ name, email, password, role });
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    if (err.message === 'Email already registered') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Authenticate user using UserService
    const user = await UserService.authenticate(email, password);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id || user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Prepare user profile data (already filtered by service)
    const userProfile = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      
      // Student specific profile data
      ...(user.role === 'student' && {
        studentId: user.studentId,
        photo: user.photo,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        phone: user.phone,
        alternatePhone: user.alternatePhone,
        class: user.class,
        section: user.section,
        rollNumber: user.rollNumber,
        admissionNumber: user.admissionNumber,
        admissionDate: user.admissionDate,
        academicYear: user.academicYear,
        address: user.address,
        guardian: user.guardian,
        bloodGroup: user.bloodGroup,
        emergencyContact: user.emergencyContact,
        medicalInfo: user.medicalInfo,
        feeCategory: user.feeCategory,
        concessionType: user.concessionType,
        concessionAmount: user.concessionAmount
      }),
      
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json({ 
      success: true,
      token, 
      user: userProfile 
    });
  } catch (err) {
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({ message: err.message });
    }
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated through this endpoint
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    
    // Use UserService to update profile
    const user = await UserService.updateProfile(userId, updateData);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      user 
    });
  } catch (err) {
    res.status(500).json({ message: 'Profile update failed', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Use UserService to get profile
    const user = await UserService.getProfile(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      success: true,
      user 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile', error: err.message });
  }
};
