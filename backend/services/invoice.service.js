const BaseService = require('./base.service');
const Invoice = require('../models/Invoice');

class InvoiceService extends BaseService {
  constructor() {
    super(Invoice);
  }

  /**
   * List all invoices
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  async listInvoices(filters = {}) {
    return await this.find(filters, {
      populate: ['student', 'fee'],
      sort: { createdAt: -1 }
    });
  }

  /**
   * Create new invoice
   * @param {Object} invoiceData
   * @returns {Promise<Object>}
   */
  async createInvoice(invoiceData) {
    return await this.create(invoiceData);
  }

  /**
   * Update invoice
   * @param {String} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateInvoice(id, updates) {
    const invoice = await this.update(id, updates);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }

  /**
   * Delete invoice
   * @param {String} id
   * @returns {Promise<Object>}
   */
  async deleteInvoice(id) {
    const invoice = await this.remove(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }

  /**
   * Get invoice by ID
   * @param {String} id
   * @returns {Promise<Object>}
   */
  async getInvoiceById(id) {
    const invoice = await this.findOne(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }
}

module.exports = new InvoiceService();
