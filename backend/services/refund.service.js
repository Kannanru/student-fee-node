const BaseService = require('./base.service');
const Refund = require('../models/Refund');

class RefundService extends BaseService {
  constructor() {
    super(Refund);
  }

  /**
   * List all refunds
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  async listRefunds(filters = {}) {
    return await this.find(filters, {
      populate: ['student', 'payment', 'fee'],
      sort: { createdAt: -1 }
    });
  }

  /**
   * Create new refund
   * @param {Object} refundData
   * @returns {Promise<Object>}
   */
  async createRefund(refundData) {
    const refund = new Refund(refundData);
    return await refund.save();
  }

  /**
   * Update refund
   * @param {String} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateRefund(id, updates) {
    const refund = await Refund.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!refund) {
      throw new Error('Refund not found');
    }
    return refund;
  }

  /**
   * Delete refund
   * @param {String} id
   * @returns {Promise<Object>}
   */
  async deleteRefund(id) {
    const refund = await Refund.findByIdAndDelete(id);
    if (!refund) {
      throw new Error('Refund not found');
    }
    return refund;
  }

  /**
   * Get refunds by student
   * @param {String} studentId
   * @returns {Promise<Array>}
   */
  async getRefundsByStudent(studentId) {
    return await this.find({ student: studentId }, {
      populate: ['payment', 'fee'],
      sort: { createdAt: -1 }
    });
  }

  /**
   * Get refund statistics
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async getStatistics(filters = {}) {
    const stats = await this.Model.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const result = {
      pending: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      processed: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      total: { count: 0, amount: 0 }
    };
    
    stats.forEach(stat => {
      if (stat._id && result.hasOwnProperty(stat._id)) {
        result[stat._id].count = stat.count;
        result[stat._id].amount = stat.totalAmount;
      }
      result.total.count += stat.count;
      result.total.amount += stat.totalAmount;
    });
    
    return result;
  }
}

module.exports = new RefundService();
