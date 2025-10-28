const invoiceService = require('../services/invoice.service');

exports.list = async (req, res) => {
  try {
    const invoices = await invoiceService.listInvoices();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invoices', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const invoice = await invoiceService.createInvoice(req.body);
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create invoice', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
    res.json(invoice);
  } catch (err) {
    if (err.message === 'Invoice not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to update invoice', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await invoiceService.deleteInvoice(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.message === 'Invoice not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to delete invoice', error: err.message });
  }
};
