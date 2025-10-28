const BaseService = require('./base.service');
const FeePlan = require('../models/FeePlan');

class FeePlanService extends BaseService {
  constructor() {
    super(FeePlan);
  }

  /**
   * List all fee plans
   * @returns {Promise<Array>}
   */
  async listFeePlans() {
    return await FeePlan.find().populate('heads.headId').populate('quotaRef').sort({ createdAt: -1 });
  }

  /**
   * Create new fee plan
   * @param {Object} planData
   * @returns {Promise<Object>}
   */
  async createFeePlan(planData) {
    const plan = new FeePlan(planData);
    return await plan.save();
  }

  /**
   * Update fee plan
   * @param {String} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateFeePlan(id, updates) {
    const plan = await FeePlan.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!plan) {
      throw new Error('Fee plan not found');
    }
    return plan;
  }

  /**
   * Delete fee plan
   * @param {String} id
   * @returns {Promise<Object>}
   */
  async deleteFeePlan(id) {
    const plan = await FeePlan.findByIdAndDelete(id);
    if (!plan) {
      throw new Error('Fee plan not found');
    }
    return plan;
  }

  /**
   * Get fee plan by ID
   * @param {String} id
   * @returns {Promise<Object>}
   */
  async getFeePlanById(id) {
    const plan = await FeePlan.findById(id).populate('heads.headId');
    if (!plan) {
      throw new Error('Fee plan not found');
    }
    return plan;
  }

  /**
   * Clone fee plan
   * @param {String} id
   * @returns {Promise<Object>}
   */
  async cloneFeePlan(id) {
    const original = await FeePlan.findById(id);
    if (!original) {
      throw new Error('Fee plan not found');
    }
    
    const clonedData = original.toObject();
    delete clonedData._id;
    delete clonedData.createdAt;
    delete clonedData.updatedAt;
    delete clonedData.__v;
    
    clonedData.code = `${original.code}-COPY`;
    clonedData.name = `${original.name} (Copy)`;
    
    const clonedPlan = new FeePlan(clonedData);
    return await clonedPlan.save();
  }

  /**
   * Update fee plan status
   * @param {String} id
   * @param {Boolean} isActive
   * @returns {Promise<Object>}
   */
  async updateFeePlanStatus(id, isActive) {
    const plan = await FeePlan.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );
    if (!plan) {
      throw new Error('Fee plan not found');
    }
    return plan;
  }
}

module.exports = new FeePlanService();
