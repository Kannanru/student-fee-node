/**
 * Dashboard Service
 * 
 * Business logic for Fee Management Dashboard:
 * - Fee statistics and collection metrics
 * - Recent payments tracking
 * - Defaulters identification
 * - Collection summary by head and mode
 * 
 * Used by: dashboardController.js
 */

const StudentBill = require('../models/StudentBill');
const Payment = require('../models/Payment');
const QuotaConfig = require('../models/QuotaConfig');
const Student = require('../models/Student');

class DashboardService {
  /**
   * Get fee statistics for dashboard widgets
   * @param {Object} filters - { academicYear, department, semester, quota }
   * @returns {Object} Fee statistics
   */
  async getFeeStats(filters = {}) {
    try {
      const { academicYear, department, semester, quota } = filters;
      
      // Build query for bills
      const billQuery = {};
      if (academicYear) billQuery.academicYear = academicYear;
      if (department) billQuery.department = department;
      if (semester) billQuery.semester = semester;
      if (quota) billQuery.quota = quota;

      // Build query for payments (confirmed only)
      const paymentQuery = { status: 'confirmed' };
      if (academicYear) paymentQuery.academicYear = academicYear;
      if (quota) paymentQuery.quota = quota;

      // 1. Total Collection
      const paymentAggregation = await Payment.aggregate([
        { $match: paymentQuery },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalAmountUSD: { $sum: '$amountUSD' },
            count: { $sum: 1 },
            uniqueStudents: { $addToSet: '$studentId' }
          }
        }
      ]);

      const totalCollection = paymentAggregation.length > 0 ? {
        amount: paymentAggregation[0].totalAmount || 0,
        amountUSD: paymentAggregation[0].totalAmountUSD || 0,
        paymentsCount: paymentAggregation[0].count || 0,
        studentsCount: paymentAggregation[0].uniqueStudents.length || 0
      } : {
        amount: 0,
        amountUSD: 0,
        paymentsCount: 0,
        studentsCount: 0
      };

      // 2. Pending Amount (from bills)
      const pendingAggregation = await StudentBill.aggregate([
        {
          $match: {
            ...billQuery,
            status: { $in: ['pending', 'partially-paid', 'overdue'] },
            balanceAmount: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            totalPending: { $sum: '$balanceAmount' },
            totalPendingUSD: { $sum: '$balanceAmountUSD' },
            count: { $sum: 1 }
          }
        }
      ]);

      const pendingAmount = pendingAggregation.length > 0 ? {
        amount: pendingAggregation[0].totalPending || 0,
        amountUSD: pendingAggregation[0].totalPendingUSD || 0,
        studentsCount: pendingAggregation[0].count || 0
      } : {
        amount: 0,
        amountUSD: 0,
        studentsCount: 0
      };

      // Overdue amount (subset of pending)
      const overdueAggregation = await StudentBill.aggregate([
        {
          $match: {
            ...billQuery,
            status: 'overdue',
            balanceAmount: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            totalOverdue: { $sum: '$balanceAmount' },
            count: { $sum: 1 }
          }
        }
      ]);

      const overdueAmount = overdueAggregation.length > 0 ? {
        amount: overdueAggregation[0].totalOverdue || 0,
        studentsCount: overdueAggregation[0].count || 0
      } : {
        amount: 0,
        studentsCount: 0
      };

      pendingAmount.overdueAmount = overdueAmount.amount;
      pendingAmount.overdueCount = overdueAmount.studentsCount;

      // 3. Student Status (Paid, Pending, Overdue)
      const statusAggregation = await StudentBill.aggregate([
        { $match: billQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const studentStatus = {
        paid: 0,
        pending: 0,
        partiallyPaid: 0,
        overdue: 0
      };

      statusAggregation.forEach(item => {
        if (item._id === 'paid') studentStatus.paid = item.count;
        else if (item._id === 'pending') studentStatus.pending = item.count;
        else if (item._id === 'partially-paid') studentStatus.partiallyPaid = item.count;
        else if (item._id === 'overdue') studentStatus.overdue = item.count;
      });

      // 4. Average Payment per Student
      const totalStudents = studentStatus.paid + studentStatus.pending + 
                           studentStatus.partiallyPaid + studentStatus.overdue;
      
      const averagePayment = totalStudents > 0 ? 
        Math.round(totalCollection.amount / totalStudents) : 0;

      // 5. Collection Trend (compare with previous period)
      let trend = null;
      if (academicYear) {
        // Get previous academic year collection
        const prevYear = this.getPreviousAcademicYear(academicYear);
        const prevYearPayments = await Payment.aggregate([
          {
            $match: {
              academicYear: prevYear,
              status: 'confirmed'
            }
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' }
            }
          }
        ]);

        if (prevYearPayments.length > 0) {
          const prevAmount = prevYearPayments[0].totalAmount;
          const currentAmount = totalCollection.amount;
          
          if (prevAmount > 0) {
            trend = {
              percentage: ((currentAmount - prevAmount) / prevAmount * 100).toFixed(2),
              direction: currentAmount >= prevAmount ? 'up' : 'down',
              previousAmount: prevAmount
            };
          }
        }
      }

      return {
        success: true,
        data: {
          totalCollection: {
            ...totalCollection,
            trend
          },
          pendingAmount,
          studentStatus: {
            ...studentStatus,
            total: totalStudents
          },
          averagePayment,
          filters: {
            academicYear,
            department,
            semester,
            quota
          },
          generatedAt: new Date()
        }
      };

    } catch (error) {
      console.error('Error in getFeeStats:', error);
      throw error;
    }
  }

  /**
   * Get recent payments (last N payments)
   * @param {Number} limit - Number of payments to fetch (default 10)
   * @param {Object} filters - Optional filters
   * @returns {Array} Recent payments
   */
  async getRecentPayments(limit = 10, filters = {}) {
    try {
      const query = { status: 'confirmed' };
      
      if (filters.academicYear) query.academicYear = filters.academicYear;
      if (filters.quota) query.quota = filters.quota;
      if (filters.department) {
        // Need to match via bill - will handle in aggregation
      }

      const payments = await Payment.find(query)
        .populate('studentId', 'name registerNumber department year')
        .populate('collectedBy', 'name')
        .sort({ paymentDate: -1 })
        .limit(limit)
        .lean();

      // Format payments for dashboard
      const formattedPayments = payments.map(payment => ({
        receiptNumber: payment.receiptNumber,
        studentName: payment.studentName || payment.studentId?.name || 'Unknown',
        registerNumber: payment.registerNumber || payment.studentId?.registerNumber || 'N/A',
        department: payment.studentId?.department || 'N/A',
        year: payment.studentId?.year || 'N/A',
        amount: payment.amount,
        amountUSD: payment.amountUSD || 0,
        currency: payment.currency,
        paymentMode: payment.paymentMode,
        paymentDate: payment.paymentDate,
        collectedBy: payment.collectedByName || payment.collectedBy?.name || 'System',
        headsPaid: payment.headsPaid || []
      }));

      return {
        success: true,
        data: formattedPayments,
        count: formattedPayments.length
      };

    } catch (error) {
      console.error('Error in getRecentPayments:', error);
      throw error;
    }
  }

  /**
   * Get fee defaulters (overdue students)
   * @param {Number} limit - Number of defaulters to fetch (default 10)
   * @param {Object} filters - Optional filters
   * @returns {Array} Defaulters list
   */
  async getDefaulters(limit = 10, filters = {}) {
    try {
      const query = {
        status: 'overdue',
        balanceAmount: { $gt: 0 }
      };

      if (filters.academicYear) query.academicYear = filters.academicYear;
      if (filters.department) query.department = filters.department;
      if (filters.year) query.year = filters.year;
      if (filters.quota) query.quota = filters.quota;
      if (filters.minDaysOverdue) query.daysOverdue = { $gte: filters.minDaysOverdue };

      const defaulters = await StudentBill.find(query)
        .populate('studentId', 'name registerNumber contactNumber email guardianPhone')
        .sort({ daysOverdue: -1, balanceAmount: -1 })
        .limit(limit)
        .lean();

      // Format defaulters for dashboard
      const formattedDefaulters = defaulters.map(bill => ({
        billNumber: bill.billNumber,
        studentId: bill.studentId?._id,
        studentName: bill.studentName || bill.studentId?.name || 'Unknown',
        registerNumber: bill.registerNumber || bill.studentId?.registerNumber || 'N/A',
        department: bill.department,
        year: bill.year,
        semester: bill.semester,
        quota: bill.quota,
        balanceAmount: bill.balanceAmount,
        balanceAmountUSD: bill.balanceAmountUSD || 0,
        dueDate: bill.dueDate,
        daysOverdue: bill.daysOverdue,
        penaltyAmount: bill.penaltyAmount || 0,
        lastPaymentDate: bill.lastPaymentDate,
        contactNumber: bill.studentId?.contactNumber,
        guardianPhone: bill.studentId?.guardianPhone,
        academicYear: bill.academicYear
      }));

      return {
        success: true,
        data: formattedDefaulters,
        count: formattedDefaulters.length,
        totalOverdueAmount: formattedDefaulters.reduce((sum, d) => sum + d.balanceAmount, 0)
      };

    } catch (error) {
      console.error('Error in getDefaulters:', error);
      throw error;
    }
  }

  /**
   * Get collection summary (by fee head and payment mode)
   * @param {Object} filters - { academicYear, startDate, endDate }
   * @returns {Object} Collection summary
   */
  async getCollectionSummary(filters = {}) {
    try {
      const { academicYear, startDate, endDate } = filters;

      const query = { status: 'confirmed' };
      
      if (academicYear) query.academicYear = academicYear;
      
      if (startDate || endDate) {
        query.paymentDate = {};
        if (startDate) query.paymentDate.$gte = new Date(startDate);
        if (endDate) query.paymentDate.$lte = new Date(endDate);
      }

      // 1. Collection by Fee Head
      const byHeadAggregation = await Payment.aggregate([
        { $match: query },
        { $unwind: '$headsPaid' },
        {
          $group: {
            _id: {
              headCode: '$headsPaid.headCode',
              headName: '$headsPaid.headName'
            },
            amount: { $sum: '$headsPaid.amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { amount: -1 } }
      ]);

      const totalHeadAmount = byHeadAggregation.reduce((sum, item) => sum + item.amount, 0);

      const byHead = byHeadAggregation.map(item => ({
        headCode: item._id.headCode,
        headName: item._id.headName,
        amount: item.amount,
        count: item.count,
        percentage: totalHeadAmount > 0 ? ((item.amount / totalHeadAmount) * 100).toFixed(2) : 0
      }));

      // 2. Collection by Payment Mode
      const byModeAggregation = await Payment.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$paymentMode',
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { amount: -1 } }
      ]);

      const totalModeAmount = byModeAggregation.reduce((sum, item) => sum + item.amount, 0);

      const byMode = byModeAggregation.map(item => ({
        mode: item._id,
        amount: item.amount,
        count: item.count,
        percentage: totalModeAmount > 0 ? ((item.amount / totalModeAmount) * 100).toFixed(2) : 0
      }));

      // 3. Collection by Quota
      const byQuotaAggregation = await Payment.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$quota',
            amount: { $sum: '$amount' },
            amountUSD: { $sum: '$amountUSD' },
            count: { $sum: 1 }
          }
        },
        { $sort: { amount: -1 } }
      ]);

      const byQuota = byQuotaAggregation.map(item => ({
        quota: item._id,
        amount: item.amount,
        amountUSD: item.amountUSD || 0,
        count: item.count,
        percentage: totalModeAmount > 0 ? ((item.amount / totalModeAmount) * 100).toFixed(2) : 0
      }));

      // 4. Daily trend (last 7 days if no date filter)
      let dailyTrend = null;
      if (!startDate && !endDate) {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const trendQuery = { ...query, paymentDate: { $gte: last7Days } };
        
        const trendAggregation = await Payment.aggregate([
          { $match: trendQuery },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' }
              },
              amount: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);

        dailyTrend = trendAggregation.map(item => ({
          date: item._id,
          amount: item.amount,
          count: item.count
        }));
      }

      return {
        success: true,
        data: {
          byHead,
          byMode,
          byQuota,
          dailyTrend,
          summary: {
            totalAmount: totalModeAmount,
            totalPayments: byModeAggregation.reduce((sum, item) => sum + item.count, 0)
          },
          filters: {
            academicYear,
            startDate,
            endDate
          },
          generatedAt: new Date()
        }
      };

    } catch (error) {
      console.error('Error in getCollectionSummary:', error);
      throw error;
    }
  }

  /**
   * Get previous academic year
   * @param {String} currentYear - e.g., "2025-2026"
   * @returns {String} Previous year - e.g., "2024-2025"
   */
  getPreviousAcademicYear(currentYear) {
    const [startYear] = currentYear.split('-');
    const prevStart = parseInt(startYear) - 1;
    const prevEnd = parseInt(startYear);
    return `${prevStart}-${prevEnd}`;
  }
}

module.exports = new DashboardService();
