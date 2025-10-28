/**
 * Receipt Controller
 * Handles PDF receipt generation for payments
 */

const Payment = require('../models/Payment');
const StudentBill = require('../models/StudentBill');
const Student = require('../models/Student');

/**
 * Generate PDF receipt for a payment
 * GET /api/receipts/:paymentId/pdf
 */
exports.generateReceiptPDF = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    // Find payment with populated data
    const payment = await Payment.findById(paymentId)
      .populate('studentId', 'firstName lastName studentId enrollmentNumber email contactNumber programName department year semester')
      .populate('billId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Get bill details
    const bill = payment.billId;
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found for this payment'
      });
    }

    // Get fee head details from bill
    const feeHeads = bill.heads || [];

    // Build HTML for PDF
    const html = generateReceiptHTML(payment, bill, feeHeads);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Receipt-${payment.receiptNumber}.pdf`);

    // For now, we'll return HTML that can be converted to PDF on client side
    // In production, use puppeteer or similar to generate actual PDF
    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        receiptNumber: payment.receiptNumber,
        billNumber: payment.billNumber,
        studentName: payment.studentName,
        studentId: payment.registerNumber,
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        paymentDate: payment.paymentDate,
        feeHeads: feeHeads.map(head => ({
          name: head.headName,
          amount: head.paidAmount || head.amount
        })),
        html: html
      }
    });

  } catch (err) {
    console.error('Error generating receipt PDF:', err);
    next(err);
  }
};

/**
 * Get receipt data for frontend PDF generation
 * GET /api/receipts/:paymentId
 */
exports.getReceiptData = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('studentId', 'firstName lastName studentId enrollmentNumber email contactNumber programName department year semester')
      .populate('billId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const bill = payment.billId;
    const student = payment.studentId;

    // Prepare receipt data
    const receiptData = {
      receiptNumber: payment.receiptNumber,
      billNumber: payment.billNumber || bill?.billNumber || 'N/A',
      paymentDate: payment.paymentDate,
      
      // Student Information
      student: {
        name: payment.studentName || `${student?.firstName} ${student?.lastName}`,
        studentId: payment.registerNumber || student?.studentId || student?.enrollmentNumber,
        program: student?.programName,
        department: student?.department,
        year: student?.year,
        semester: student?.semester,
        email: student?.email,
        phone: student?.contactNumber
      },
      
      // Payment Information
      payment: {
        amount: payment.amount,
        mode: payment.paymentMode,
        reference: payment.paymentReference || payment.transactionId || 'N/A',
        status: payment.status,
        collectedBy: payment.collectedBy
      },
      
      // Fee Heads
      feeHeads: (bill?.heads || []).map(head => ({
        name: head.headName,
        code: head.headCode,
        amount: head.paidAmount || head.amount || 0,
        taxAmount: head.taxAmount || 0,
        totalAmount: head.totalAmount || head.amount || 0
      })),
      
      // Totals
      subtotal: (bill?.heads || []).reduce((sum, h) => sum + (h.amount || 0), 0),
      taxTotal: (bill?.heads || []).reduce((sum, h) => sum + (h.taxAmount || 0), 0),
      total: payment.amount
    };

    return res.json({
      success: true,
      data: receiptData
    });

  } catch (err) {
    console.error('Error fetching receipt data:', err);
    next(err);
  }
};

// Helper function to generate HTML receipt
function generateReceiptHTML(payment, bill, feeHeads) {
  const formattedDate = new Date(payment.paymentDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #667eea;
          margin: 0;
        }
        .receipt-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .info-section {
          flex: 1;
        }
        .info-section h3 {
          color: #667eea;
          margin-bottom: 10px;
        }
        .info-row {
          margin: 5px 0;
        }
        .label {
          font-weight: bold;
          display: inline-block;
          width: 150px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #667eea;
          color: white;
        }
        .total-row {
          font-weight: bold;
          background-color: #f0f9ff;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MGDC Medical College</h1>
        <h2>Fee Payment Receipt</h2>
      </div>
      
      <div class="receipt-info">
        <div class="info-section">
          <h3>Receipt Details</h3>
          <div class="info-row">
            <span class="label">Receipt No:</span>
            <span>${payment.receiptNumber}</span>
          </div>
          <div class="info-row">
            <span class="label">Bill No:</span>
            <span>${payment.billNumber || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Date:</span>
            <span>${formattedDate}</span>
          </div>
        </div>
        
        <div class="info-section">
          <h3>Student Details</h3>
          <div class="info-row">
            <span class="label">Name:</span>
            <span>${payment.studentName}</span>
          </div>
          <div class="info-row">
            <span class="label">Student ID:</span>
            <span>${payment.registerNumber}</span>
          </div>
        </div>
      </div>
      
      <h3>Fee Details</h3>
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Fee Head</th>
            <th>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${feeHeads.map((head, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${head.headName}</td>
              <td>₹${(head.paidAmount || head.amount || 0).toLocaleString('en-IN')}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2">Total Amount</td>
            <td>₹${payment.amount.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="info-section">
        <h3>Payment Information</h3>
        <div class="info-row">
          <span class="label">Payment Mode:</span>
          <span>${payment.paymentMode.toUpperCase()}</span>
        </div>
        <div class="info-row">
          <span class="label">Transaction ID:</span>
          <span>${payment.paymentReference || payment.transactionId || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="label">Status:</span>
          <span>${payment.status.toUpperCase()}</span>
        </div>
      </div>
      
      <div class="footer">
        <p>This is a computer-generated receipt and does not require a signature.</p>
        <p>For any queries, please contact the accounts department.</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = exports;
