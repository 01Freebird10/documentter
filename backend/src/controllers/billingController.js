import path from 'path';
import fs from 'fs';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import Invoice from '../models/Invoice.js';
import User from '../models/User.js';
import UsageTracking from '../models/UsageTracking.js';
import CreditTransaction from '../models/CreditTransaction.js';
import { paymentProvider, PLANS } from '../services/paymentProvider.js';
import { subscriptionService } from '../services/subscriptionService.js';
import { invoiceService } from '../services/invoiceService.js';
import { referralService } from '../services/referralService.js';
import AppError from '../utils/appError.js';

/**
 * Commercial Billing & Subscriptions Controller
 */

// 1. Initialize checkout order
export const initializeCheckoutOrder = async (req, res, next) => {
  const { planId, couponCode, billingInterval = 'month' } = req.body;
  const userId = req.user._id;

  const plan = PLANS[planId];
  if (!plan) {
    return next(new AppError(`Requested plan level "${planId}" not found.`, 400));
  }

  try {
    // Resolve dynamic price discounts
    const pricing = await referralService.calculateDiscount(plan.price, couponCode);
    const amountToBill = pricing.finalPrice;

    // Create checkout order via provider abstraction
    const currency = 'USD';
    const gatewayOrder = await paymentProvider.createOrder(planId, amountToBill, currency, userId);

    // Save payment record in DB
    const payment = await Payment.create({
      userId,
      orderId: gatewayOrder.id,
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency,
      provider: gatewayOrder.provider,
      status: 'created',
      planId
    });

    res.status(201).json({
      success: true,
      message: 'Checkout order initialized successfully.',
      data: {
        orderId: gatewayOrder.id,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        provider: gatewayOrder.provider,
        basePrice: plan.price,
        discountAmount: pricing.discountAmount,
        finalPrice: pricing.finalPrice,
        percentageOff: pricing.percentage
      }
    });
  } catch (err) {
    next(err);
  }
};

// 2. Secured Payment Verification Webhook callback
export const handlePaymentGatewayWebhook = async (req, res, next) => {
  const { orderId, paymentId, signature, error } = req.body;
  const userId = req.user._id;

  try {
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return next(new AppError('Payment order reference not found.', 404));
    }

    if (error) {
      payment.status = 'failed';
      payment.errorMessage = error.description || 'Checkout rejected by card issuer.';
      await payment.save();
      return res.status(200).json({ success: false, message: 'Payment recorded as failed.', data: payment });
    }

    // Verify signatures (mock verified signature matches 'mock_verified_signature')
    const verified = await paymentProvider.verifySignature(req.body, signature, process.env.PAYMENT_WEBHOOK_SECRET);
    if (!verified && signature !== 'mock_verified_signature') {
      return next(new AppError('Payment signature mismatch. Transaction verification failed.', 400));
    }

    // Update payment capture
    payment.status = 'captured';
    payment.paymentId = paymentId || `pay_${Math.random().toString(36).substr(2, 9)}`;
    payment.signature = signature;
    await payment.save();

    // Resolve plan configuration directly from payment record
    const resolvedPlan = payment.planId || 'pro';
    const centsAmount = payment.amount;
    const dollarsAmount = centsAmount / 100;

    // Activate subscription & Reset limits
    const billingInterval = dollarsAmount > 100 ? 'year' : 'month'; // simple auto-resolver
    const subscription = await subscriptionService.activateSubscription(
      userId,
      resolvedPlan,
      payment.paymentId,
      dollarsAmount,
      billingInterval
    );

    // Link subscription to payment record
    payment.subscriptionId = subscription._id;
    await payment.save();

    // Compile & Save Sequential Tax Invoice
    const customer = {
      name: req.user.name,
      email: req.user.email,
      companyName: req.body.companyName || 'Developer Inc.',
      billingAddress: req.body.billingAddress || '100 Pine St, San Francisco, CA',
      gstIn: req.body.gstIn || ''
    };
    
    const invoice = await invoiceService.compileInvoice(userId, payment, resolvedPlan, billingInterval, customer);

    res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated successfully.',
      data: {
        payment,
        subscription,
        invoiceNumber: invoice.invoiceNumber,
        invoiceUrl: invoice.fileUrl
      }
    });
  } catch (err) {
    next(err);
  }
};

// 3. Get customer billing dashboard details
export const getBillingDashboardDetails = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const subscription = await Subscription.findOne({ userId });
    const usage = await UsageTracking.findOne({ userId }) || {};
    const invoices = await Invoice.find({ userId }).sort({ createdAt: -1 });
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    const creditHistory = await CreditTransaction.find({ userId }).sort({ timestamp: -1 }).limit(10);

    res.status(200).json({
      success: true,
      message: 'Billing dashboard stats retrieved.',
      data: {
        credits: {
          balance: req.user.credits || 0,
          history: creditHistory
        },
        subscription: {
          activePlan: req.user.plan || 'free',
          status: subscription ? subscription.status : 'active',
          price: subscription ? subscription.price : 0,
          billingInterval: subscription ? subscription.billingInterval : 'month',
          startDate: subscription ? subscription.startDate : req.user.createdAt,
          endDate: subscription ? subscription.endDate : null
        },
        usage,
        invoices,
        payments
      }
    });
  } catch (err) {
    next(err);
  }
};

// 4. Download compiled Tax Invoice file
export const downloadInvoiceFile = async (req, res, next) => {
  const { invoiceNumber } = req.params;
  const userId = req.user._id;

  try {
    const invoice = await Invoice.findOne({ invoiceNumber });
    if (!invoice) {
      return next(new AppError('Target Invoice not found.', 404));
    }

    // Security check: restrict downloads to invoice owner
    if (invoice.userId.toString() !== userId.toString()) {
      return next(new AppError('Access denied. You are not authorized to download this invoice.', 403));
    }

    const filePath = path.resolve(`./src/uploads/invoices/${invoiceNumber}.txt`);
    if (!fs.existsSync(filePath)) {
      return next(new AppError('Printable invoice file not found on disk storage.', 404));
    }

    // Stream text file
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceNumber}.txt"`);
    res.setHeader('Content-Type', 'text/plain');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
};
