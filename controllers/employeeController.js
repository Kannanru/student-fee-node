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

exports.update = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) throw { status: 404, message: 'Employee not found' };
    res.json(employee);
  } catch (err) {
    next(err);
  }
};