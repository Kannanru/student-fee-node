const feePlanService = require('../services/feePlan.service');

exports.list = async (req, res) => {
  try {
    const plans = await feePlanService.listFeePlans();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fee plans', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const plan = await feePlanService.getFeePlanById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Fee plan not found' });
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fee plan', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const plan = await feePlanService.createFeePlan(req.body);
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create fee plan', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const plan = await feePlanService.updateFeePlan(req.params.id, req.body);
    res.json(plan);
  } catch (err) {
    if (err.message === 'Fee plan not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to update fee plan', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await feePlanService.deleteFeePlan(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.message === 'Fee plan not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to delete fee plan', error: err.message });
  }
};

exports.clone = async (req, res) => {
  try {
    const clonedPlan = await feePlanService.cloneFeePlan(req.params.id);
    res.status(201).json(clonedPlan);
  } catch (err) {
    if (err.message === 'Fee plan not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to clone fee plan', error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    console.log('Update status called:', {
      id: req.params.id,
      isActive: req.body.isActive,
      body: req.body
    });
    
    const plan = await feePlanService.updateFeePlanStatus(req.params.id, req.body.isActive);
    
    console.log('Status updated successfully:', {
      id: plan._id,
      code: plan.code,
      isActive: plan.isActive
    });
    
    res.json(plan);
  } catch (err) {
    console.error('Error updating status:', err.message);
    
    if (err.message === 'Fee plan not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to update fee plan status', error: err.message });
  }
};
