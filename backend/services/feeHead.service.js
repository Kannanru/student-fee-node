const BaseService = require('./base.service');
const FeeHead = require('../models/FeeHead');

class FeeHeadService extends BaseService {
  constructor() {
    super(FeeHead);
  }

  /**
   * List all fee heads with pagination
   * @param {Object} options - { page, limit }
   * @returns {Promise<Object>} - { data, total, page, pages, limit }
   */
  async listFeeHeads(options = {}) {
    return await this.find({}, {
      page: options.page || 1,
      limit: options.limit || 10,
      sort: { displayOrder: 1, name: 1 }
    });
  }

  /**
   * Get active fee heads
   * @returns {Promise<Array>}
   */
  async getActiveFeeHeads() {
    return await FeeHead.find({ status: 'active' }).sort({ displayOrder: 1, name: 1 });
  }

  /**
   * Get fee head by ID
   * @param {String} id
   * @returns {Promise<Object>}
   */
  async getFeeHeadById(id) {
    return await this.findById(id);
  }

  /**
   * Create new fee head
   * @param {Object} data - Fee head data
   * @returns {Promise<Object>}
   */
  async createFeeHead(data) {
    // Check for duplicate code
    const existing = await FeeHead.findOne({ code: data.code });
    if (existing) {
      throw new Error('Code already exists');
    }

    const head = new FeeHead(data);
    return await head.save();
  }

  /**
   * Update fee head
   * @param {String} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateFeeHead(id, updates) {
    // Don't allow code updates (unique constraint)
    const updateData = { ...updates };
    delete updateData.code;
    
    const head = await this.update(id, updateData);
    if (!head) {
      throw new Error('Fee head not found');
    }
    return head;
  }

  /**
   * Toggle fee head status
   * @param {String} id
   * @returns {Promise<Object>}
   */
  async toggleFeeHeadStatus(id) {
    const head = await FeeHead.findById(id);
    if (!head) {
      throw new Error('Fee head not found');
    }
    head.status = head.status === 'active' ? 'inactive' : 'active';
    return await head.save();
  }

  /**
   * Delete fee head
   * @param {String} id
   * @returns {Promise<Object>}
   */
  async deleteFeeHead(id) {
    const head = await this.remove(id);
    if (!head) {
      throw new Error('Fee head not found');
    }
    return head;
  }
}

module.exports = new FeeHeadService();
