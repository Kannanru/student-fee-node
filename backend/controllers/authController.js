// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash, role });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Prepare user profile data (exclude sensitive information)
    const userProfile = {
      id: user._id,
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
    
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Return updated profile (excluding password)
    const userProfile = user.toObject();
    delete userProfile.password;
    
    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      user: userProfile 
    });
  } catch (err) {
    res.status(500).json({ message: 'Profile update failed', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ 
      success: true,
      user 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile', error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash, role });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Prepare user profile data (exclude sensitive information)
    const userProfile = {
      id: user._id,
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
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
