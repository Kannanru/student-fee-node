const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create Student
exports.create = async (req, res, next) => {
  try {
    const required = ['studentId','enrollmentNumber','firstName','lastName','dob','gender','email','contactNumber','permanentAddress','programName','admissionDate','academicYear','guardianName','guardianContact','emergencyContactName','emergencyContactNumber','studentType','password'];
    const missing = required.filter(f => !req.body[f]);
    if (missing.length) {
      return res.status(400).json({ success: false, message: 'Missing required fields', fields: missing });
    }

    const email = String(req.body.email).toLowerCase();
    const dup = await Student.findOne({ $or: [ { email }, { studentId: req.body.studentId }, { enrollmentNumber: req.body.enrollmentNumber } ] });
    if (dup) {
      return res.status(409).json({ success: false, message: 'Student already exists with same email/studentId/enrollmentNumber' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const payload = { ...req.body, email, password: hashedPassword };
    const student = new Student(payload);
    await student.save();
    const data = student.toObject();
    delete data.password;
    return res.status(201).json({ success: true, message: 'Student created successfully', data });
  } catch (err) {
    next(err);
  }
};

// Student Login (mobile)
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
    const student = await Student.findOne({ email: String(email).toLowerCase(), status: 'active' });
    if (!student) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, student.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const token = jwt.sign({ studentId: student._id, email: student.email, role: 'student' }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    const profile = student.toObject();
    delete profile.password;
    return res.json({ success: true, message: 'Login successful', data: { token, student: profile } });
  } catch (err) { next(err); }
};

// Update Student
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    if (update.password) update.password = await bcrypt.hash(update.password, 10);
    if (update.email) update.email = String(update.email).toLowerCase();
    const student = await Student.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const data = student.toObject();
    delete data.password;
    return res.json({ success: true, message: 'Student updated successfully', data });
  } catch (err) { next(err); }
};

// Get All Students with filters
exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, programName, academicYear, semester, status, studentType, search } = req.query;
    const q = {};
    if (programName) q.programName = programName;
    if (academicYear) q.academicYear = academicYear;
    if (semester) q.semester = semester;
    if (status) q.status = status;
    if (studentType) q.studentType = studentType;
    if (search) {
      q.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [students, total] = await Promise.all([
      Student.find(q).select('-password').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Student.countDocuments(q)
    ]);
    return res.json({ success: true, message: 'Students retrieved successfully', data: students, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), totalStudents: total } });
  } catch (err) { next(err); }
};

// Get by ID (profile)
exports.getById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    return res.json({ success: true, message: 'Student retrieved successfully', data: student });
  } catch (err) { next(err); }
};
