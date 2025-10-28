/**
 * Base Service Class
 * All services should extend this class for common CRUD functionality
 */
class BaseService {
  constructor(Model) {
    this.Model = Model;
  }

  /**
   * Find documents with filters, pagination, and sorting
   * @param {Object} filters - MongoDB query filters
   * @param {Object} options - { page, limit, sort, select, populate }
   * @returns {Promise<Object>} - { data, total, page, pages }
   */
  async find(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      select = '',
      populate = []
    } = options;

    const skip = (page - 1) * limit;
    
    let query = this.Model.find(filters);
    
    if (select) query = query.select(select);
    if (populate.length > 0) {
      populate.forEach(pop => {
        query = query.populate(pop);
      });
    }
    
    query = query.sort(sort).skip(skip).limit(limit);
    
    const data = await query.exec();
    const total = await this.Model.countDocuments(filters);
    
    return {
      data,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    };
  }

  /**
   * Find single document by ID
   * @param {String} id - Document ID
   * @param {Object} options - { select, populate }
   * @returns {Promise<Object>} - Document
   */
  async findById(id, options = {}) {
    const { select = '', populate = [] } = options;
    
    let query = this.Model.findById(id);
    
    if (select) query = query.select(select);
    if (populate.length > 0) {
      populate.forEach(pop => {
        query = query.populate(pop);
      });
    }
    
    return await query.exec();
  }

  /**
   * Alias for findById
   * @param {String} id - Document ID
   * @param {Object} options - { select, populate }
   * @returns {Promise<Object>} - Document
   */
  async findOne(id, options = {}) {
    return await this.findById(id, options);
  }

  /**
   * Find one by filters
   * @param {Object} filters - MongoDB query filters
   * @param {Object} options - { select, populate }
   * @returns {Promise<Object>} - Document
   */
  async findOneByFilter(filters, options = {}) {
    const { select = '', populate = [] } = options;
    
    let query = this.Model.findOne(filters);
    
    if (select) query = query.select(select);
    if (populate.length > 0) {
      populate.forEach(pop => {
        query = query.populate(pop);
      });
    }
    
    return await query.exec();
  }

  /**
   * Create new document
   * @param {Object} data - Document data
   * @returns {Promise<Object>} - Created document
   */
  async create(data) {
    const doc = new this.Model(data);
    return await doc.save();
  }

  /**
   * Update document by ID
   * @param {String} id - Document ID
   * @param {Object} updates - Update data
   * @param {Object} options - Mongoose options
   * @returns {Promise<Object>} - Updated document
   */
  async update(id, updates, options = { new: true, runValidators: true }) {
    return await this.Model.findByIdAndUpdate(id, updates, options);
  }

  /**
   * Delete document by ID
   * @param {String} id - Document ID
   * @returns {Promise<Object>} - Deleted document
   */
  async remove(id) {
    return await this.Model.findByIdAndDelete(id);
  }

  /**
   * Count documents matching filters
   * @param {Object} filters - MongoDB query filters
   * @returns {Promise<Number>} - Count
   */
  async count(filters = {}) {
    return await this.Model.countDocuments(filters);
  }

  /**
   * Check if document exists
   * @param {Object} filters - MongoDB query filters
   * @returns {Promise<Boolean>}
   */
  async exists(filters) {
    const count = await this.count(filters);
    return count > 0;
  }

  /**
   * Bulk create documents
   * @param {Array} dataArray - Array of document data
   * @returns {Promise<Array>} - Created documents
   */
  async bulkCreate(dataArray) {
    return await this.Model.insertMany(dataArray);
  }
}

module.exports = BaseService;
