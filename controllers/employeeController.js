// DEPRECATED: Use controllers under backend/controllers.
module.exports = new Proxy({}, {
  get() {
    throw new Error('Deprecated controller: use backend/controllers/employeeController.js');
  }
});