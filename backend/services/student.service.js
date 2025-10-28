const BaseService = require('./base.service');
const Student = require('../models/Student');

class StudentService extends BaseService {
  constructor() {
    super(Student);
  }

  /**
   * Find student by student ID
   * @param {String} studentId
   * @returns {Promise<Object>}
   */
  async findByStudentId(studentId) {
    return await this.findOneByFilter({ studentId });
  }

  /**
   * Get students by class and section
   * @param {String} className
   * @param {String} section
   * @returns {Promise<Array>}
   */
  async findByClass(className, section = null) {
    const filters = { class: className };
    if (section) filters.section = section;
    
    return await this.find(filters);
  }

  /**
   * Get student with fee details
   * @param {String} studentId
   * @returns {Promise<Object>}
   */
  async getStudentWithFees(studentId) {
    return await this.findOne(studentId, {
      populate: ['feeCategory', 'concessionType']
    });
  }

  /**
   * Search students by name, studentId, or rollNumber
   * @param {String} searchTerm
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async search(searchTerm, options = {}) {
    const filters = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { studentId: { $regex: searchTerm, $options: 'i' } },
        { rollNumber: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    
    return await this.find(filters, options);
  }

  /**
   * Create student with validation
   * @param {Object} studentData
   * @param {String} hashedPassword
   * @returns {Promise<Object>}
   */
  async createStudent(studentData, hashedPassword) {
    const email = String(studentData.email).toLowerCase();
    
    console.log('🔍 Service: Creating student with data');
    console.log('Section from studentData:', studentData.section);
    console.log('Roll Number from studentData:', studentData.rollNumber);
    
    // Check for duplicates
    const dup = await this.Model.findOne({
      $or: [
        { email },
        { studentId: studentData.studentId },
        { enrollmentNumber: studentData.enrollmentNumber }
      ]
    });
    
    if (dup) {
      throw { status: 409, message: 'Student already exists with same email/studentId/enrollmentNumber' };
    }
    
    const payload = { ...studentData, email, password: hashedPassword };
    console.log('Payload section:', payload.section);
    console.log('Payload rollNumber:', payload.rollNumber);
    
    const student = new this.Model(payload);
    console.log('Student model before save - section:', student.section);
    console.log('Student model before save - rollNumber:', student.rollNumber);
    
    await student.save();
    
    console.log('Student model after save - section:', student.section);
    console.log('Student model after save - rollNumber:', student.rollNumber);
    
    const data = student.toObject();
    delete data.password;
    return data;
  }

  /**
   * Find student by email for authentication
   * @param {String} email
   * @returns {Promise<Object>}
   */
  async findByEmail(email) {
    return await this.Model.findOne({
      email: String(email).toLowerCase(),
      status: 'active'
    });
  }

  /**
   * Update student with password handling
   * @param {String} id
   * @param {Object} updates
   * @param {String} hashedPassword - Optional hashed password
   * @returns {Promise<Object>}
   */
  async updateStudent(id, updates, hashedPassword = null) {
    const update = { ...updates };
    if (hashedPassword) update.password = hashedPassword;
    if (update.email) update.email = String(update.email).toLowerCase();
    
    const student = await this.Model.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true
    });
    
    if (!student) {
      throw { status: 404, message: 'Student not found' };
    }
    
    const data = student.toObject();
    delete data.password;
    return data;
  }

  /**
   * Get students with pagination and filters
   * @param {Object} filters
   * @param {Object} pagination
   * @returns {Promise<Object>}
   */
  async getStudentsWithPagination(filters, pagination) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [students, total] = await Promise.all([
      this.Model.find(filters)
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      this.Model.countDocuments(filters)
    ]);
    
    return {
      students,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalStudents: total
      }
    };
  }
}

module.exports = new StudentService();
