const BaseService = require('./base.service');
const Concession = require('../models/Concession');

class ConcessionService extends BaseService {
  constructor() {
    super(Concession);
  }

  /**
   * List all concessions
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  async listConcessions(filters = {}) {
    return await this.find(filters, {
      populate: ['student', 'fee'],
      sort: { createdAt: -1 }
    });
  }

  /**
   * Create new concession
   * @param {Object} concessionData
   * @returns {Promise<Object>}
   */
  async createConcession(concessionData) {
    const concession = new Concession(concessionData);
    return await concession.save();
  }

  /**
   * Update concession
   * @param {String} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateConcession(id, updates) {
    const concession = await Concession.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!concession) {
      throw new Error('Concession not found');
    }
    return concession;
  }

  /**
   * Delete concession
   * @param {String} id
   * @returns {Promise<Object>}
   */
  async deleteConcession(id) {
    const concession = await Concession.findByIdAndDelete(id);
    if (!concession) {
      throw new Error('Concession not found');
    }
    return concession;
  }

  /**
   * Get concessions by student
   * @param {String} studentId
   * @returns {Promise<Array>}
   */
  async getConcessionsByStudent(studentId) {
    return await this.find({ student: studentId }, {
      populate: ['fee'],
      sort: { createdAt: -1 }
    });
  }
}

module.exports = new ConcessionService();
