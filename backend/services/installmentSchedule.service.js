const BaseService = require('./base.service');
const InstallmentSchedule = require('../models/InstallmentSchedule');

class InstallmentScheduleService extends BaseService {
  constructor() {
    super(InstallmentSchedule);
  }

  /**
   * List all installment schedules
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  async listSchedules(filters = {}) {
    return await this.find(filters, {
      populate: ['feePlan', 'student'],
      sort: { createdAt: -1 }
    });
  }

  /**
   * Create new installment schedule
   * @param {Object} scheduleData
   * @returns {Promise<Object>}
   */
  async createSchedule(scheduleData) {
    const schedule = new InstallmentSchedule(scheduleData);
    return await schedule.save();
  }

  /**
   * Update installment schedule
   * @param {String} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateSchedule(id, updates) {
    const schedule = await InstallmentSchedule.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!schedule) {
      throw new Error('Installment schedule not found');
    }
    return schedule;
  }

  /**
   * Delete installment schedule
   * @param {String} id
   * @returns {Promise<Object>}
   */
  async deleteSchedule(id) {
    const schedule = await InstallmentSchedule.findByIdAndDelete(id);
    if (!schedule) {
      throw new Error('Installment schedule not found');
    }
    return schedule;
  }

  /**
   * Get installment schedule by ID
   * @param {String} id
   * @returns {Promise<Object>}
   */
  async getScheduleById(id) {
    const schedule = await InstallmentSchedule.findById(id).populate(['feePlan', 'student']);
    if (!schedule) {
      throw new Error('Installment schedule not found');
    }
    return schedule;
  }
}

module.exports = new InstallmentScheduleService();
