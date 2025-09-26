const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create Student
exports.create = async (req, res, next) => {
  try {
    const { password, email } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const studentData = {
      ...req.body,
      password: hashedPassword,
      email: email.toLowerCase()
    };

    const student = new Student(studentData);
    await student.save();

    // Remove password from response
    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: studentResponse
    });

  } catch (err) {
    next(err);
  }
};

// Student Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const student = await Student.findOne({ 
      email: email.toLowerCase(),
      status: 'active'
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { 
        studentId: student._id,
        email: student.email,
        role: 'student'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        student: studentResponse
      }
    });

  } catch (err) {
    next(err);
  }
};


// Update Student
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }

    const student = await Student.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: studentResponse
    });

  } catch (err) {
    next(err);
  }
};

// Get All Students
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    const students = await Student.find({})
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments({});

    res.json({
      success: true,
      message: 'Students retrieved successfully',
      data: students,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalStudents: total
      }
    });

  } catch (err) {
    next(err);
  }
};

// Get Student by ID
exports.getById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student retrieved successfully',
      data: student
    });

  } catch (err) {
    next(err);
  }
};
