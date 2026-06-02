import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Force Mock payments & Redis
process.env.USE_MOCK_REDIS = 'true';
process.env.PAYMENT_PROVIDER = 'mock';

// Dynamically import SaaS & billing services to avoid static ESM hoisting issues
const { PLANS } = await import('./src/services/paymentProvider.js');
const { subscriptionService } = await import('./src/services/subscriptionService.js');
const { invoiceService } = await import('./src/services/invoiceService.js');
const { referralService } = await import('./src/services/referralService.js');
const { initializeCheckoutOrder, handlePaymentGatewayWebhook, getBillingDashboardDetails } = await import('./src/controllers/billingController.js');
const { getAdminRevenueAnalytics } = await import('./src/controllers/revenueController.js');

const User = (await import('./src/models/User.js')).default;
const Project = (await import('./src/models/Project.js')).default;
const Payment = (await import('./src/models/Payment.js')).default;
const Subscription = (await import('./src/models/Subscription.js')).default;
const Invoice = (await import('./src/models/Invoice.js')).default;
const CreditTransaction = (await import('./src/models/CreditTransaction.js')).default;
const Referral = (await import('./src/models/Referral.js')).default;
const UsageTracking = (await import('./src/models/UsageTracking.js')).default;

dotenv.config();

const runTests = async () => {
  console.log('\n======================================================');
  console.log('       REPOMIND AI PAYMENTS & REVENUE ENGINE TEST       ');
  console.log('======================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/repomind_billing_test';
  
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('[STEP 1] Connected to MongoDB database successfully.');

    // Seed mock buyer
    const mockBuyer = await User.findOneAndUpdate(
      { email: 'buyer@repomind.ai' },
      { name: 'SaaS Buyer', plan: 'free', credits: 0 },
      { upsert: true, new: true }
    );
    console.log(`- Seeded mock user: ${mockBuyer.name} (${mockBuyer.email})`);

    // ------------------------------------------------------------------
    // TEST 1: Plan Checkout & Coupon Discount Calculations
    // ------------------------------------------------------------------
    console.log('\n[TEST 2] Verifying Plan checkout & Coupon calculations...');
    const reqCheckout = {
      body: { planId: 'pro', couponCode: 'STUDENT20', billingInterval: 'month' },
      user: mockBuyer
    };

    const resMock = {
      status(code) { this.code = code; return this; },
      json(data) { this.data = data; return this; }
    };

    await initializeCheckoutOrder(reqCheckout, resMock, (err) => { throw err; });
    console.log('- Checkout Order Initialized Response:', resMock.data?.data);

    const basePrice = PLANS.pro.price;
    const finalPrice = resMock.data?.data?.finalPrice;
    console.log(`- Base Plan Cost: $${basePrice}, Final Billed Cost (20% Off STUDENT20): $${finalPrice}`);

    if (finalPrice === basePrice - (basePrice * 0.2)) {
      console.log('=> Checkout & Coupons: SUCCESS! ✅');
    } else {
      console.error('=> Checkout & Coupons: FAILED! ❌');
    }

    // ------------------------------------------------------------------
    // TEST 2: Payment Webhook & Subscription Activation
    // ------------------------------------------------------------------
    console.log('\n[TEST 3] Verifying Payment webhook verification & Plan activation...');
    const initializedOrder = resMock.data?.data;
    
    const reqWebhook = {
      body: {
        orderId: initializedOrder.orderId,
        paymentId: `rzp_pay_${Math.random().toString(36).substr(2, 9)}`,
        signature: 'mock_verified_signature',
        companyName: 'AST Analytics Ltd.',
        billingAddress: '500 Technology Dr, Bangalore, KA, India',
        gstIn: '29AABCR1234M1ZS'
      },
      user: mockBuyer
    };

    const resWebhookMock = {
      status(code) { this.code = code; return this; },
      json(data) { this.data = data; return this; }
    };

    await handlePaymentGatewayWebhook(reqWebhook, resWebhookMock, (err) => { throw err; });
    console.log('- Webhook Verification Output:', resWebhookMock.data?.data);

    // Fetch updated user to check quotas and plans
    const activeBuyer = await User.findById(mockBuyer._id);
    console.log(`- Active plan tier after activation: "${activeBuyer.plan}"`);
    console.log(`- Added credits quota allowance: ${activeBuyer.credits} credits`);

    const usageRecord = await UsageTracking.findOne({ userId: mockBuyer._id });
    console.log(`- Reset monthly usage tracking counter initialized:`, usageRecord ? 'READY' : 'NULL');

    if (activeBuyer.plan === 'pro' && activeBuyer.credits === 100) {
      console.log('=> Subscription Licensing: SUCCESS! ✅');
    } else {
      console.error('=> Subscription Licensing: FAILED! ❌');
    }

    // ------------------------------------------------------------------
    // TEST 3: Tax Invoicing & GST-Ready Sequential Numbers
    // ------------------------------------------------------------------
    console.log('\n[TEST 4] Verifying GST Tax Invoice compiler...');
    const invoiceNumber = resWebhookMock.data?.data?.invoiceNumber;
    console.log(`- Generated Unique Tax Invoice Number: ${invoiceNumber}`);

    const invoiceFile = path.resolve(`./src/uploads/invoices/${invoiceNumber}.txt`);
    if (fs.existsSync(invoiceFile)) {
      const text = fs.readFileSync(invoiceFile, 'utf8');
      console.log('- Compiled tax invoice preview:');
      console.log(text.split('\n').slice(0, 10).join('\n')); // print first 10 lines
      console.log('=> Tax Invoicing: SUCCESS! ✅');
    } else {
      console.error('=> Tax Invoicing: FAILED! ❌');
    }

    // ------------------------------------------------------------------
    // TEST 4: Credit Consumption Audit Logs
    // ------------------------------------------------------------------
    console.log('\n[TEST 5] Verifying Credit top-ups, deductions & Audit trails...');
    console.log(`- Current Credit balance before deduction: ${activeBuyer.credits}`);
    
    // Simulate compilation deduction
    await subscriptionService.consumeCredits(
      mockBuyer._id,
      5, // deduct 5 credits
      'Compiled Technical slide deck presentation: AST-Analysis-Test',
      null
    );

    const billedBuyer = await User.findById(mockBuyer._id);
    console.log(`- New Credit balance after deduction: ${billedBuyer.credits}`);

    const lastTransaction = await CreditTransaction.findOne({ userId: mockBuyer._id }).sort({ timestamp: -1 });
    console.log(`- Logged Credit transaction: [${lastTransaction.type}] ${lastTransaction.description} (Amt: ${lastTransaction.amount})`);

    if (billedBuyer.credits === 95 && lastTransaction.amount === -5) {
      console.log('=> Credit Ledger: SUCCESS! ✅');
    } else {
      console.error('=> Credit Ledger: FAILED! ❌');
    }

    // ------------------------------------------------------------------
    // TEST 5: Referral SignUp Incentives
    // ------------------------------------------------------------------
    console.log('\n[TEST 6] Verifying Referral affiliate rewards loop...');
    // referrer (SaaS Buyer) generates referral ledger
    const referral = await referralService.createReferralLedger(mockBuyer._id, 'BUYER10');
    console.log(`- Referrer generated invite code: ${referral.referralCode}`);

    // Seed mock invitee
    const mockInvitee = await User.findOneAndUpdate(
      { email: 'invitee@repomind.ai' },
      { name: 'Invitee Joiner', plan: 'free', credits: 0 },
      { upsert: true, new: true }
    );

    // Invitee registers with referrer code
    await referralService.processSignupReferral(mockInvitee._id, referral.referralCode);

    // Verify referrer received reward
    const rewardedReferrer = await User.findById(mockBuyer._id);
    console.log(`- Referrer credit balance after invite signup (rewarded +20 credits): ${rewardedReferrer.credits}`);

    const referralTx = await CreditTransaction.findOne({ userId: mockBuyer._id, type: 'referral_bonus' });
    console.log(`- Referrer reward transaction: [${referralTx.type}] ${referralTx.description} (Amt: +${referralTx.amount})`);

    if (rewardedReferrer.credits === 115 && referralTx.amount === 20) {
      console.log('=> Referral Incentives: SUCCESS! ✅');
    } else {
      console.error('=> Referral Incentives: FAILED! ❌');
    }

    // ------------------------------------------------------------------
    // TEST 6: Administrative Revenue Dashboard Telemetry
    // ------------------------------------------------------------------
    console.log('\n[TEST 7] Verifying Admin Revenue Dashboard aggregated calculations...');
    const reqAdmin = {};
    const resAdminMock = {
      status(code) { this.code = code; return this; },
      json(data) { this.data = data; return this; }
    };

    await getAdminRevenueAnalytics(reqAdmin, resAdminMock, (err) => { throw err; });
    console.log('- Revenue Diagnostics Output:', resAdminMock.data?.data);

    const financials = resAdminMock.data?.data?.financials;
    console.log(`- Gross Revenue: $${financials.grossRevenueDollars}`);
    console.log(`- Net Revenue:   $${financials.netRevenueDollars}`);
    console.log(`- Monthly MRR:   $${financials.monthlyRecurringRevenueMRR}`);
    console.log(`- Annual ARR:    $${financials.annualRecurringRevenueARR}`);

    if (financials.grossRevenueDollars > 0 && financials.monthlyRecurringRevenueMRR === finalPrice) {
      console.log('=> Admin Revenue Analytics: SUCCESS! ✅');
    } else {
      console.error('=> Admin Revenue Analytics: FAILED! ❌');
    }

    // ------------------------------------------------------------------
    // CLEAN UP TEST LEDGERS
    // ------------------------------------------------------------------
    console.log('\n[CLEANUP] Sweeping test database traces...');
    await Project.deleteMany({ userId: mockBuyer._id });
    await Invoice.deleteMany({ userId: mockBuyer._id });
    await CreditTransaction.deleteMany({ userId: mockBuyer._id });
    await Subscription.deleteOne({ userId: mockBuyer._id });
    await Referral.deleteOne({ referrerId: mockBuyer._id });
    await UsageTracking.deleteOne({ userId: mockBuyer._id });
    await Payment.deleteMany({ userId: mockBuyer._id });
    await User.deleteMany({ email: { $in: ['buyer@repomind.ai', 'invitee@repomind.ai'] } });
    
    // Sweep invoice file from disk
    if (invoiceNumber) {
      await invoiceService.deleteInvoiceFile(invoiceNumber);
    }

  } catch (err) {
    console.error('[TEST CRITICAL FAULT]', err);
  } finally {
    await mongoose.disconnect();
    console.log('- Closed database connection.');
  }

  console.log('\n======================================================');
  console.log('          ALL COMMERCIAL ENGINE TESTS COMPLETED          ');
  console.log('======================================================\n');
  process.exit(0);
};

runTests().catch(err => {
  console.error('[FATAL RUN EXCEPTION]', err);
  process.exit(1);
});
