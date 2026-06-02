import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Invoice from '../models/Invoice.js';

/**
 * Administrative SaaS Revenue Telemetry Controller
 */
export const getAdminRevenueAnalytics = async (req, res, next) => {
  try {
    // 1. Gather payment transactions statistics
    const allPayments = await Payment.find();
    const capturedPayments = allPayments.filter(p => p.status === 'captured');
    const failedPaymentsCount = allPayments.filter(p => p.status === 'failed').length;
    const refundedPayments = allPayments.filter(p => p.status === 'refunded');

    const totalRevenue = capturedPayments.reduce((acc, curr) => acc + (curr.amount / 100), 0);
    const totalRefunded = refundedPayments.reduce((acc, curr) => acc + curr.refundedAmount, 0);

    // 2. Resolve Monthly & Annual Recurring Revenues (MRR / ARR)
    const activeSubs = await Subscription.find({ status: 'active' });
    const mrr = activeSubs.reduce((acc, curr) => acc + curr.price, 0);
    const arr = mrr * 12;

    // 3. Subscription Churn Rates (Canceled vs Total Subscriptions count)
    const totalSubsCount = await Subscription.countDocuments();
    const canceledSubsCount = await Subscription.countDocuments({ status: 'canceled' });
    const churnRatePercent = totalSubsCount > 0 ? parseFloat(((canceledSubsCount / totalSubsCount) * 100).toFixed(2)) : 0;

    // 4. Checkout Conversion Rates (Captured payments over Total Orders)
    const totalOrdersCount = allPayments.length;
    const conversionRatePercent = totalOrdersCount > 0 ? parseFloat(((capturedPayments.length / totalOrdersCount) * 100).toFixed(2)) : 0;

    // 5. Aggregate top buyer accounts profiles
    // Group and sum captured payment amounts per user
    const topBuyersAggregate = await Payment.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: '$userId', totalSpent: { $sum: '$amount' }, transactions: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    // Populate user emails and names for top buyers list
    const topCustomers = [];
    for (const buyer of topBuyersAggregate) {
      const user = await User.findById(buyer._id, 'name email plan');
      if (user) {
        topCustomers.push({
          userId: buyer._id,
          name: user.name,
          email: user.email,
          planTier: user.plan,
          totalSpentDollars: buyer.totalSpent / 100,
          transactionCount: buyer.transactions
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'SaaS commercial revenue analytics fetched successfully.',
      data: {
        financials: {
          grossRevenueDollars: totalRevenue,
          totalRefundedDollars: totalRefunded,
          netRevenueDollars: totalRevenue - totalRefunded,
          monthlyRecurringRevenueMRR: mrr,
          annualRecurringRevenueARR: arr,
          currency: 'USD'
        },
        telemetry: {
          totalSubscriptions: totalSubsCount,
          activeSubscriptions: activeSubs.length,
          canceledSubscriptions: canceledSubsCount,
          churnRatePercentage: churnRatePercent,
          conversionRatePercentage: conversionRatePercent,
          failedPaymentsCount
        },
        topCustomers,
        refunds: refundedPayments.map(p => ({
          orderId: p.orderId,
          refundId: p.paymentId || 'MOCK_REF_ID',
          amount: p.refundedAmount,
          currency: p.currency,
          date: p.updatedAt
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};
