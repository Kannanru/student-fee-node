const BaseService = require('./base.service');
const Payment = require('../models/Payment');

class PaymentService extends BaseService {
  constructor() {
    super(Payment);
  }

  /**
   * List all payments
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  async listPayments(filters = {}) {
    return await this.find(filters, {
      populate: ['student', 'fee', 'invoice'],
      sort: { createdAt: -1 }
    });
  }

  /**
   * Create new payment
   * @param {Object} paymentData
   * @returns {Promise<Object>}
   */
  async createPayment(paymentData) {
    return await this.create(paymentData);
  }

  /**
   * Process payment
   * @param {Object} paymentData
   * @returns {Promise<Object>}
   */
  async processPayment(paymentData) {
    return await this.create(paymentData);
  }

  /**
   * Get payment history for student
   * @param {String} studentId
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async getPaymentHistory(studentId, options = {}) {
    return await this.find(
      { student: studentId },
      {
        ...options,
        populate: ['invoice', 'fee'],
        sort: { createdAt: -1 }
      }
    );
  }

  /**
   * Get payment by transaction ID
   * @param {String} transactionId
   * @returns {Promise<Object>}
   */
  async findByTransactionId(transactionId) {
    return await this.findOneByFilter({ transactionId });
  }

  /**
   * Update payment status
   * @param {String} paymentId
   * @param {String} status
   * @param {Object} additionalData
   * @returns {Promise<Object>}
   */
  async updatePaymentStatus(paymentId, status, additionalData = {}) {
    return await this.update(paymentId, {
      status,
      ...additionalData,
      updatedAt: new Date()
    });
  }

  /**
   * Get payment statistics
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Object>}
   */
  async getStatistics(startDate, endDate) {
    const stats = await this.Model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const result = {
      success: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      failed: { count: 0, amount: 0 },
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

  /**
   * Get collections report
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async getCollectionsReport(startDate, endDate, filters = {}) {
    return await this.find(
      {
        ...filters,
        status: 'success',
        createdAt: { $gte: startDate, $lte: endDate }
      },
      {
        populate: ['student', 'fee'],
        sort: { createdAt: -1 }
      }
    );
  }
}

module.exports = new PaymentService();
