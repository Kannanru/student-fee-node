const BaseService = require('./base.service');
const LedgerEntry = require('../models/LedgerEntry');

class LedgerService extends BaseService {
  constructor() {
    super(LedgerEntry);
  }

  /**
   * Get ledger entries by student
   * @param {String} studentId
   * @returns {Promise<Array>}
   */
  async getEntriesByStudent(studentId) {
    return await this.find({ studentId }, {
      populate: ['fee', 'payment'],
      sort: { transactionDate: -1 }
    });
  }

  /**
   * Create ledger entry
   * @param {Object} entryData
   * @returns {Promise<Object>}
   */
  async createEntry(entryData) {
    const entry = new LedgerEntry(entryData);
    return await entry.save();
  }

  /**
   * Get ledger summary for student
   * @param {String} studentId
   * @returns {Promise<Object>}
   */
  async getStudentSummary(studentId) {
    const entries = await this.Model.find({ studentId }).sort({ transactionDate: -1 });
    
    const summary = {
      totalDebit: 0,
      totalCredit: 0,
      balance: 0,
      entryCount: entries.length,
      entries: entries
    };

    entries.forEach(entry => {
      if (entry.type === 'debit') {
        summary.totalDebit += entry.amount;
      } else if (entry.type === 'credit') {
        summary.totalCredit += entry.amount;
      }
    });

    summary.balance = summary.totalDebit - summary.totalCredit;
    
    return summary;
  }

  /**
   * Get ledger entries by date range
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  async getEntriesByDateRange(startDate, endDate, filters = {}) {
    return await this.find({
      ...filters,
      transactionDate: { $gte: startDate, $lte: endDate }
    }, {
      populate: ['studentId', 'fee', 'payment'],
      sort: { transactionDate: -1 }
    });
  }
}

module.exports = new LedgerService();
