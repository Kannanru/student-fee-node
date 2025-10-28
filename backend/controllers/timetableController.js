const Timetable = require('../models/Timetable');

exports.create = async (req, res, next) => {
  try {
    const required = ['className','programName','academicYear','dayOfWeek','startTime','endTime'];
    const missing = required.filter(f => !req.body[f]);
    if (missing.length) return res.status(400).json({ success: false, message: 'Missing required fields', fields: missing });
    const doc = await Timetable.create(req.body);
    res.status(201).json({ success: true, message: 'Timetable created', data: doc });
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const { programName, academicYear, dayOfWeek, className, year, semester, section } = req.query;
    const q = {};
    
    // Filter by program
    if (programName) q.programName = programName;
    
    // Filter by day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    if (dayOfWeek != null) q.dayOfWeek = parseInt(dayOfWeek);
    
    // Filter by year
    if (year) q.year = parseInt(year);
    
    // Filter by semester (optional - don't filter if not provided)
    if (semester) q.semester = parseInt(semester);
    
    // Only return active timetables
    q.isActive = true;
    
    console.log('Timetable query:', q);
    const items = await Timetable.find(q).sort({ periodNumber: 1, startTime: 1 });
    console.log(`Found ${items.length} timetable periods`);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.getByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const items = await Timetable.find({ studentIds: studentId }).sort({ dayOfWeek: 1, startTime: 1 });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Timetable.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Timetable not found' });
    res.json({ success: true, message: 'Timetable updated', data: doc });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Timetable.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Timetable not found' });
    res.json({ success: true, message: 'Timetable deleted' });
  } catch (err) { next(err); }
};

exports.getCurrentSession = async (req, res, next) => {
  try {
    const { programName, year, section } = req.query;
    
    if (!programName || !year) {
      return res.status(400).json({ 
        success: false, 
        message: 'programName and year are required' 
      });
    }

    // Build className from parameters (e.g., "BDS-1", "MBBS-2-A")
    const className = section ? `${programName}-${year}-${section}` : `${programName}-${year}`;
    
    // Get current day and time
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    // Find current session
    const session = await Timetable.findOne({
      className: className,
      dayOfWeek: dayOfWeek,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime }
    }).populate('hallId', 'hallName hallNumber building');
    
    if (!session) {
      return res.json({ 
        success: true, 
        message: 'No active session found',
        data: null 
      });
    }
    
    // Format response
    const sessionInfo = {
      subject: session.subject || 'N/A',
      hallName: session.hallId ? session.hallId.hallName || `Hall ${session.hallId.hallNumber}` : (session.room || 'N/A'),
      periodNumber: session.periodNumber || 1,
      startTime: session.startTime,
      endTime: session.endTime,
      faculty: session.facultyName || session.instructor || 'N/A',
      hallId: session.hallId?._id,
      timetableId: session._id
    };
    
    return res.json({ 
      success: true, 
      message: 'Current session retrieved',
      data: sessionInfo 
    });
  } catch (err) { 
    next(err); 
  }
};
