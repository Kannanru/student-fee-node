const Employee = require('../models/Employee');

exports.create = async (req, res, next) => {
  try {
    const { name, employeeId, mobile, email, role, status, department, photo, altContact, address, dob, joiningDate, emergencyContact, qualifications, experience, bloodGroup } = req.body;
    if (!name || !employeeId || !mobile || !email || !role) throw { status: 400, message: 'Required fields are missing' };
    const existing = await Employee.findOne({ email });
    if (existing) throw { status: 409, message: 'Email already exists' };
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { q, role, status, page = 1, limit = 20 } = req.query;
    const match = {};
    if (q) match.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { employeeId: { $regex: q, $options: 'i' } }
    ];
    if (role) match.role = role;
    if (status) match.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Employee.find(match).skip(skip).limit(Number(limit)).sort({ name: 1 }),
      Employee.countDocuments(match)
    ]);
    res.json({ success: true, data: items, page: Number(page), limit: Number(limit), total });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const doc = await Employee.findById(req.params.id);
    if (!doc) return res.status(404).json({ success:false, message: 'Employee not found' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) throw { status: 404, message: 'Employee not found' };
    res.json(employee);
  } catch (err) {
    next(err);
  }
};