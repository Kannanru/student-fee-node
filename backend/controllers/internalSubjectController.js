const InternalSubject = require('../models/InternalSubject');
const InternalMarks = require('../models/InternalMarks');

// Get all internal subjects with optional filters
exports.getAllSubjects = async (req, res, next) => {
  try {
    const { department, year, semester, isActive } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const subjects = await InternalSubject.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ department: 1, year: 1, semester: 1, subjectName: 1 });

    res.json({
      success: true,
      message: 'Subjects retrieved successfully',
      data: subjects,
      count: subjects.length
    });
  } catch (error) {
    console.error('Error in getAllSubjects:', error);
    next(error);
  }
};

// Get single subject by ID
exports.getSubjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subject = await InternalSubject.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error in getSubjectById:', error);
    next(error);
  }
};

// Create new internal subject
exports.createSubject = async (req, res, next) => {
  try {
    const {
      subjectCode,
      subjectName,
      department,
      year,
      semester,
      maxMarks,
      passingMarks,
      credits,
      description
    } = req.body;

    // Check if subject already exists
    const existingSubject = await InternalSubject.findOne({
      subjectCode,
      department,
      year,
      semester
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this code already exists for this department, year, and semester'
      });
    }

    const subject = new InternalSubject({
      subjectCode: subjectCode.toUpperCase(),
      subjectName,
      department,
      year,
      semester,
      maxMarks: maxMarks || 100,
      passingMarks: passingMarks || 40,
      credits: credits || 0,
      description,
      createdBy: req.user.id
    });

    await subject.save();

    const populatedSubject = await InternalSubject.findById(subject._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: populatedSubject
    });
  } catch (error) {
    console.error('Error in createSubject:', error);
    next(error);
  }
};

// Update internal subject
exports.updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      subjectCode,
      subjectName,
      department,
      year,
      semester,
      maxMarks,
      passingMarks,
      credits,
      description,
      isActive
    } = req.body;

    const subject = await InternalSubject.findById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check for duplicate if code, department, year, or semester is being changed
    if (subjectCode || department || year || semester) {
      const existingSubject = await InternalSubject.findOne({
        _id: { $ne: id },
        subjectCode: subjectCode || subject.subjectCode,
        department: department || subject.department,
        year: year || subject.year,
        semester: semester || subject.semester
      });

      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Another subject with this code already exists for this department, year, and semester'
        });
      }
    }

    // Update fields
    if (subjectCode) subject.subjectCode = subjectCode.toUpperCase();
    if (subjectName) subject.subjectName = subjectName;
    if (department) subject.department = department;
    if (year) subject.year = year;
    if (semester) subject.semester = semester;
    if (maxMarks !== undefined) subject.maxMarks = maxMarks;
    if (passingMarks !== undefined) subject.passingMarks = passingMarks;
    if (credits !== undefined) subject.credits = credits;
    if (description !== undefined) subject.description = description;
    if (isActive !== undefined) subject.isActive = isActive;
    subject.updatedBy = req.user.id;

    await subject.save();

    const updatedSubject = await InternalSubject.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: updatedSubject
    });
  } catch (error) {
    console.error('Error in updateSubject:', error);
    next(error);
  }
};

// Delete internal subject
exports.deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subject = await InternalSubject.findById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if there are any marks entries for this subject
    const marksCount = await InternalMarks.countDocuments({ subjectId: id });

    if (marksCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete subject. ${marksCount} marks entries exist for this subject. Consider deactivating instead.`
      });
    }

    await InternalSubject.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteSubject:', error);
    next(error);
  }
};

// Get subjects by department and year
exports.getSubjectsByDepartmentYear = async (req, res, next) => {
  try {
    const { department, year } = req.params;

    const subjects = await InternalSubject.find({
      department,
      year: parseInt(year),
      isActive: true
    }).sort({ semester: 1, subjectName: 1 });

    res.json({
      success: true,
      message: 'Subjects retrieved successfully',
      data: subjects,
      count: subjects.length
    });
  } catch (error) {
    console.error('Error in getSubjectsByDepartmentYear:', error);
    next(error);
  }
};
