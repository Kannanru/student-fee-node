const InternalMarks = require('../models/InternalMarks');
const InternalSubject = require('../models/InternalSubject');
const Student = require('../models/Student');

// Get all marks with optional filters
exports.getAllMarks = async (req, res, next) => {
  try {
    const { studentId, academicYear, department, year, semester } = req.query;

    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (academicYear) filter.academicYear = academicYear;
    if (department) filter.department = department;
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);

    const marks = await InternalMarks.find(filter)
      .populate('studentId', 'studentId name firstName lastName programName year semester')
      .populate('subjectId', 'subjectCode subjectName maxMarks passingMarks credits')
      .populate('enteredBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ academicYear: -1, year: 1, semester: 1 });

    res.json({
      success: true,
      message: 'Marks retrieved successfully',
      data: marks,
      count: marks.length
    });
  } catch (error) {
    console.error('Error in getAllMarks:', error);
    next(error);
  }
};

// Get marks for a specific student
exports.getStudentMarks = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;

    const filter = { studentId };
    if (academicYear) filter.academicYear = academicYear;

    const marks = await InternalMarks.find(filter)
      .populate('subjectId', 'subjectCode subjectName maxMarks passingMarks credits semester')
      .populate('enteredBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ academicYear: -1, semester: 1 });

    // Group marks by academic year
    const groupedByYear = {};
    marks.forEach(mark => {
      if (!groupedByYear[mark.academicYear]) {
        groupedByYear[mark.academicYear] = [];
      }
      groupedByYear[mark.academicYear].push(mark);
    });

    // Calculate totals and averages per year
    const summary = Object.keys(groupedByYear).map(year => {
      const yearMarks = groupedByYear[year];
      const totalMarksObtained = yearMarks.reduce((sum, m) => sum + m.marksObtained, 0);
      const totalMaxMarks = yearMarks.reduce((sum, m) => sum + m.maxMarks, 0);
      const percentage = totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(2) : 0;

      return {
        academicYear: year,
        subjects: yearMarks,
        totalSubjects: yearMarks.length,
        totalMarksObtained,
        totalMaxMarks,
        percentage,
        averagePercentage: (yearMarks.reduce((sum, m) => sum + parseFloat(m.percentage), 0) / yearMarks.length).toFixed(2)
      };
    });

    res.json({
      success: true,
      message: 'Student marks retrieved successfully',
      data: {
        marks,
        summary
      }
    });
  } catch (error) {
    console.error('Error in getStudentMarks:', error);
    next(error);
  }
};

// Get marks for a student by academic year
exports.getStudentMarksByYear = async (req, res, next) => {
  try {
    const { studentId, academicYear } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get all subjects for this student's department and year
    const subjects = await InternalSubject.find({
      department: student.programName,
      year: student.year || 1,
      isActive: true
    }).sort({ semester: 1, subjectName: 1 });

    // Get existing marks for these subjects
    const subjectIds = subjects.map(s => s._id);
    const marks = await InternalMarks.find({
      studentId,
      academicYear,
      subjectId: { $in: subjectIds }
    }).populate('subjectId');

    // Create a map of subject to marks
    const marksMap = new Map();
    marks.forEach(mark => {
      marksMap.set(mark.subjectId._id.toString(), mark);
    });

    // Build response with all subjects and their marks (if entered)
    const subjectsWithMarks = subjects.map(subject => {
      const mark = marksMap.get(subject._id.toString());
      return {
        subject,
        marks: mark || null
      };
    });

    // Calculate summary
    const totalMarksObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalMaxMarks = marks.reduce((sum, m) => sum + m.maxMarks, 0);
    const percentage = totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      message: 'Marks retrieved successfully',
      data: {
        academicYear,
        student: {
          _id: student._id,
          studentId: student.studentId,
          name: student.name || `${student.firstName} ${student.lastName}`,
          programName: student.programName,
          year: student.year
        },
        subjects: subjectsWithMarks,
        summary: {
          totalSubjects: subjects.length,
          marksEntered: marks.length,
          totalMarksObtained,
          totalMaxMarks,
          percentage
        }
      }
    });
  } catch (error) {
    console.error('Error in getStudentMarksByYear:', error);
    next(error);
  }
};

// Create or update internal marks
exports.saveMarks = async (req, res, next) => {
  try {
    const {
      studentId,
      subjectId,
      academicYear,
      marksObtained,
      remarks
    } = req.body;

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Validate subject exists
    const subject = await InternalSubject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Validate marks
    if (marksObtained < 0 || marksObtained > subject.maxMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${subject.maxMarks}`
      });
    }

    // Check if marks already exist
    let marks = await InternalMarks.findOne({
      studentId,
      subjectId,
      academicYear
    });

    if (marks) {
      // Update existing marks
      marks.marksObtained = marksObtained;
      marks.maxMarks = subject.maxMarks;
      marks.remarks = remarks;
      marks.updatedBy = req.user.id;
      await marks.save();

      const updatedMarks = await InternalMarks.findById(marks._id)
        .populate('subjectId', 'subjectCode subjectName maxMarks passingMarks credits')
        .populate('studentId', 'studentId name firstName lastName')
        .populate('enteredBy', 'name email')
        .populate('updatedBy', 'name email');

      res.json({
        success: true,
        message: 'Marks updated successfully',
        data: updatedMarks
      });
    } else {
      // Create new marks entry
      marks = new InternalMarks({
        studentId,
        subjectId,
        academicYear,
        department: student.programName,
        year: student.year || 1,
        semester: subject.semester,
        marksObtained,
        maxMarks: subject.maxMarks,
        remarks,
        enteredBy: req.user.id
      });

      await marks.save();

      const newMarks = await InternalMarks.findById(marks._id)
        .populate('subjectId', 'subjectCode subjectName maxMarks passingMarks credits')
        .populate('studentId', 'studentId name firstName lastName')
        .populate('enteredBy', 'name email');

      res.status(201).json({
        success: true,
        message: 'Marks saved successfully',
        data: newMarks
      });
    }
  } catch (error) {
    console.error('Error in saveMarks:', error);
    next(error);
  }
};

// Bulk save marks for multiple students
exports.bulkSaveMarks = async (req, res, next) => {
  try {
    const { marks } = req.body; // Array of marks objects

    if (!Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Marks array is required'
      });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const markData of marks) {
      try {
        const { studentId, subjectId, academicYear, marksObtained, remarks } = markData;

        const subject = await InternalSubject.findById(subjectId);
        if (!subject) {
          results.failed.push({
            studentId,
            subjectId,
            error: 'Subject not found'
          });
          continue;
        }

        const student = await Student.findById(studentId);
        if (!student) {
          results.failed.push({
            studentId,
            subjectId,
            error: 'Student not found'
          });
          continue;
        }

        let mark = await InternalMarks.findOne({
          studentId,
          subjectId,
          academicYear
        });

        if (mark) {
          mark.marksObtained = marksObtained;
          mark.maxMarks = subject.maxMarks;
          mark.remarks = remarks;
          mark.updatedBy = req.user.id;
          await mark.save();
        } else {
          mark = new InternalMarks({
            studentId,
            subjectId,
            academicYear,
            department: student.programName,
            year: student.year || 1,
            semester: subject.semester,
            marksObtained,
            maxMarks: subject.maxMarks,
            remarks,
            enteredBy: req.user.id
          });
          await mark.save();
        }

        results.success.push({
          studentId,
          subjectId,
          marksId: mark._id
        });
      } catch (error) {
        results.failed.push({
          studentId: markData.studentId,
          subjectId: markData.subjectId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk save completed. ${results.success.length} successful, ${results.failed.length} failed`,
      data: results
    });
  } catch (error) {
    console.error('Error in bulkSaveMarks:', error);
    next(error);
  }
};

// Delete marks entry
exports.deleteMarks = async (req, res, next) => {
  try {
    const { id } = req.params;

    const marks = await InternalMarks.findById(id);
    if (!marks) {
      return res.status(404).json({
        success: false,
        message: 'Marks entry not found'
      });
    }

    await InternalMarks.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Marks entry deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteMarks:', error);
    next(error);
  }
};
