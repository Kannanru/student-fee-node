// DEPRECATED: Use controllers under backend/controllers. This file is kept only to avoid require errors in old code.
module.exports = new Proxy({}, {
  get() {
    throw new Error('Deprecated controller: use backend/controllers/feeController.js');
  }
});