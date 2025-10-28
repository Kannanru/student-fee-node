const BaseService = require('./base.service');
const Employee = require('../models/Employee');

class EmployeeService extends BaseService {
  constructor() {
    super(Employee);
  }

  /**
   * Find employee by employee ID
   * @param {String} employeeId
   * @returns {Promise<Object>}
   */
  async findByEmployeeId(employeeId) {
    return await this.findOneByFilter({ employeeId });
  }

  /**
   * Get employees by department
   * @param {String} department
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findByDepartment(department, options = {}) {
    return await this.find({ department }, options);
  }

  /**
   * Get employees by category (faculty, administrative, technical, support)
   * @param {String} category
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findByCategory(category, options = {}) {
    return await this.find({ category }, options);
  }

  /**
   * Search employees by name, employeeId, or department
   * @param {String} searchTerm
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async search(searchTerm, options = {}) {
    const filters = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { employeeId: { $regex: searchTerm, $options: 'i' } },
        { department: { $regex: searchTerm, $options: 'i' } },
        { designation: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    
    return await this.find(filters, options);
  }

  /**
   * Get employee statistics by category
   * @returns {Promise<Object>}
   */
  async getStatsByCategory() {
    const stats = await this.Model.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result = {
      faculty: 0,
      administrative: 0,
      technical: 0,
      support: 0
    };
    
    stats.forEach(stat => {
      if (stat._id && result.hasOwnProperty(stat._id)) {
        result[stat._id] = stat.count;
      }
    });
    
    return result;
  }

  /**
   * Create employee with validation
   * @param {Object} employeeData
   * @returns {Promise<Object>}
   */
  async createEmployee(employeeData) {
    console.log('🔍 Service: Checking for duplicate email/employeeId');
    
    // Check for duplicate email
    const existingEmail = await this.Model.findOne({ email: employeeData.email });
    if (existingEmail) {
      console.log('❌ Email already exists:', employeeData.email);
      throw { status: 409, message: 'Email already exists' };
    }
    
    // Check for duplicate employeeId
    const existingId = await this.Model.findOne({ employeeId: employeeData.employeeId });
    if (existingId) {
      console.log('❌ Employee ID already exists:', employeeData.employeeId);
      throw { status: 409, message: 'Employee ID already exists' };
    }
    
    console.log('✅ No duplicates found, creating employee');
    
    const employee = new this.Model(employeeData);
    await employee.save();
    
    console.log('✅ Employee saved to database:', employee._id);
    
    return employee;
  }

  /**
   * Update employee
   * @param {String} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateEmployee(id, updates) {
    console.log('🔍 Service: Updating employee:', id);
    
    // If email is being updated, check for duplicates
    if (updates.email) {
      const existing = await this.Model.findOne({ 
        email: updates.email,
        _id: { $ne: id }
      });
      if (existing) {
        console.log('❌ Email already exists:', updates.email);
        throw { status: 409, message: 'Email already exists' };
      }
    }
    
    // If employeeId is being updated, check for duplicates
    if (updates.employeeId) {
      const existing = await this.Model.findOne({ 
        employeeId: updates.employeeId,
        _id: { $ne: id }
      });
      if (existing) {
        console.log('❌ Employee ID already exists:', updates.employeeId);
        throw { status: 409, message: 'Employee ID already exists' };
      }
    }
    
    const employee = await this.Model.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });
    
    if (!employee) {
      console.log('❌ Employee not found:', id);
      throw { status: 404, message: 'Employee not found' };
    }
    
    console.log('✅ Employee updated successfully:', employee._id);
    
    return employee;
  }

  /**
   * Delete employee
   * @param {String} id
   * @returns {Promise<Object>}
   */
  async deleteEmployee(id) {
    console.log('🔍 Service: Deleting employee:', id);
    
    const employee = await this.Model.findByIdAndDelete(id);
    
    if (!employee) {
      console.log('❌ Employee not found:', id);
      throw { status: 404, message: 'Employee not found' };
    }
    
    console.log('✅ Employee deleted successfully:', employee._id);
    
    return employee;
  }

  /**
   * Get comprehensive employee statistics
   * @returns {Promise<Object>}
   */
  async getEmployeeStats() {
    const [total, byStatus, byCategory, byDepartment] = await Promise.all([
      this.Model.countDocuments(),
      this.Model.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      this.Model.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]),
      this.Model.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    const statusStats = {
      active: 0,
      inactive: 0,
      'on-leave': 0,
      terminated: 0
    };
    
    byStatus.forEach(item => {
      if (item._id && statusStats.hasOwnProperty(item._id)) {
        statusStats[item._id] = item.count;
      }
    });
    
    const categoryStats = {
      faculty: 0,
      administrative: 0,
      technical: 0,
      support: 0
    };
    
    byCategory.forEach(item => {
      if (item._id && categoryStats.hasOwnProperty(item._id)) {
        categoryStats[item._id] = item.count;
      }
    });
    
    const departmentStats = {};
    byDepartment.forEach(item => {
      if (item._id) {
        departmentStats[item._id] = item.count;
      }
    });
    
    return {
      total,
      byStatus: statusStats,
      byCategory: categoryStats,
      byDepartment: departmentStats
    };
  }

  /**
   * Get employees with pagination
   * @param {Object} filters
   * @param {Object} pagination
   * @returns {Promise<Object>}
   */
  async getEmployeesWithPagination(filters, pagination) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (Number(page) - 1) * Number(limit);
    
    const [items, total] = await Promise.all([
      this.Model.find(filters)
        .skip(skip)
        .limit(Number(limit))
        .sort({ name: 1 }),
      this.Model.countDocuments(filters)
    ]);
    
    return {
      items,
      page: Number(page),
      limit: Number(limit),
      total
    };
  }

  /**
   * Find employee by email
   * @param {String} email
   * @returns {Promise<Object>}
   */
  async findByEmail(email) {
    return await this.Model.findOne({ email });
  }
}

module.exports = new EmployeeService();
