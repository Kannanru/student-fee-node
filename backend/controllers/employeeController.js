const employeeService = require('../services/employee.service');

/**
 * Create a new employee
 * POST /api/employees
 */
exports.create = async (req, res, next) => {
  try {
    console.log('📝 Employee creation request received');
    console.log('Request body keys:', Object.keys(req.body));
    
    const { firstName, lastName, employeeId, phone, email, department, designation, category, qualification, experience, joiningDate, dateOfBirth, gender } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !employeeId || !phone || !email) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields are missing',
        required: ['firstName', 'lastName', 'employeeId', 'phone', 'email']
      });
    }
    
    if (!department || !designation || !category || !qualification || experience === undefined) {
      console.log('❌ Missing professional information');
      return res.status(400).json({ 
        success: false, 
        message: 'Professional information is incomplete',
        required: ['department', 'designation', 'category', 'qualification', 'experience']
      });
    }
    
    if (!joiningDate || !dateOfBirth || !gender) {
      console.log('❌ Missing personal information');
      return res.status(400).json({ 
        success: false, 
        message: 'Personal information is incomplete',
        required: ['joiningDate', 'dateOfBirth', 'gender']
      });
    }
    
    console.log('✅ All required fields present');
    console.log('Creating employee:', { firstName, lastName, employeeId, email, department });
    
    const employee = await employeeService.createEmployee(req.body);
    
    console.log('✅ Employee created successfully:', employee._id);
    console.log('Employee details:', { 
      id: employee._id, 
      name: `${employee.firstName} ${employee.lastName}`,
      employeeId: employee.employeeId,
      department: employee.department
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Employee created successfully',
      data: employee 
    });
  } catch (err) {
    console.error('❌ Error creating employee:', err.message);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ 
        success: false, 
        message: `${field} already exists` 
      });
    }
    next(err);
  }
};

/**
 * Get all employees with filtering and pagination
 * GET /api/employees
 */
exports.list = async (req, res, next) => {
  try {
    console.log('📋 Employee list request received');
    console.log('Query params:', req.query);
    
    const { q, department, category, status, designation, page = 1, limit = 20 } = req.query;
    
    const filters = {};
    
    // Search query
    if (q && q.trim()) {
      filters.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { employeeId: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } },
        { designation: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Filters
    if (department && department !== 'all') filters.department = department;
    if (category && category !== 'all') filters.category = category;
    if (status && status !== 'all') filters.status = status;
    if (designation && designation !== 'all') filters.designation = designation;
    
    console.log('Applied filters:', filters);
    
    const result = await employeeService.getEmployeesWithPagination(filters, { page, limit });
    
    console.log(`✅ Found ${result.total} employees, returning page ${result.page}`);
    
    res.json({ 
      success: true, 
      ...result 
    });
  } catch (err) {
    console.error('❌ Error fetching employees:', err.message);
    next(err);
  }
};

/**
 * Get employee by ID
 * GET /api/employees/:id
 */
exports.getById = async (req, res, next) => {
  try {
    console.log('🔍 Fetching employee by ID:', req.params.id);
    
    const employee = await employeeService.findOne(req.params.id);
    
    if (!employee) {
      console.log('❌ Employee not found');
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    console.log('✅ Employee found:', { 
      id: employee._id, 
      name: `${employee.firstName} ${employee.lastName}`,
      employeeId: employee.employeeId
    });
    
    res.json({ 
      success: true, 
      data: employee 
    });
  } catch (err) {
    console.error('❌ Error fetching employee:', err.message);
    next(err);
  }
};

/**
 * Update employee
 * PUT /api/employees/:id
 */
exports.update = async (req, res, next) => {
  try {
    console.log('📝 Employee update request received');
    console.log('Employee ID:', req.params.id);
    console.log('Update fields:', Object.keys(req.body));
    
    // Remove fields that shouldn't be updated
    const { _id, createdAt, updatedAt, __v, ...updateData } = req.body;
    
    console.log('Updating employee with data:', updateData);
    
    const employee = await employeeService.updateEmployee(req.params.id, updateData);
    
    console.log('✅ Employee updated successfully:', employee._id);
    
    res.json({ 
      success: true, 
      message: 'Employee updated successfully',
      data: employee 
    });
  } catch (err) {
    console.error('❌ Error updating employee:', err.message);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ 
        success: false, 
        message: `${field} already exists` 
      });
    }
    next(err);
  }
};

/**
 * Delete employee
 * DELETE /api/employees/:id
 */
exports.delete = async (req, res, next) => {
  try {
    console.log('🗑️ Employee delete request received');
    console.log('Employee ID:', req.params.id);
    
    const employee = await employeeService.deleteEmployee(req.params.id);
    
    if (!employee) {
      console.log('❌ Employee not found');
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    console.log('✅ Employee deleted successfully:', employee._id);
    
    res.json({ 
      success: true, 
      message: 'Employee deleted successfully',
      data: employee 
    });
  } catch (err) {
    console.error('❌ Error deleting employee:', err.message);
    next(err);
  }
};

/**
 * Get employee statistics
 * GET /api/employees/stats
 */
exports.getStats = async (req, res, next) => {
  try {
    console.log('📊 Fetching employee statistics');
    
    const stats = await employeeService.getEmployeeStats();
    
    console.log('✅ Statistics retrieved:', stats);
    
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (err) {
    console.error('❌ Error fetching statistics:', err.message);
    next(err);
  }
};