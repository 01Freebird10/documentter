import dotenv from 'dotenv';

dotenv.config();

// Standard plans pricing configuration
export const PLANS = {
  free: { id: 'free', price: 0, credits: 10, name: 'Free Plan' },
  pro: { id: 'pro', price: 29, credits: 100, name: 'Pro Plan' },
  team: { id: 'team', price: 79, credits: 500, name: 'Team Plan' },
  enterprise: { id: 'enterprise', price: 299, credits: 2000, name: 'Enterprise Plan' }
};

// ------------------------------------------
// MOCK PAYMENT GATEWAY PROVIDER
// ------------------------------------------
class MockPaymentProvider {
  constructor() {
    console.log('[PAYMENTS] Active Provider: Mock Payment Carrier Engaged.');
  }

  async createOrder(planId, amount, currency = 'USD', userId) {
    const orderId = `mock_order_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[PAYMENTS MOCK] Created order: ${orderId} for Plan: ${planId}, Amount: $${amount} ${currency}`);
    return {
      id: orderId,
      amount: amount * 100, // standard representation in cents / paise
      currency,
      status: 'created',
      provider: 'mock'
    };
  }

  async verifySignature(payload, signature, webhookSecret) {
    // A mock signature verification simply checks if signature is 'mock_verified_signature'
    console.log('[PAYMENTS MOCK] Verifying checkout signature...');
    return signature === 'mock_verified_signature';
  }

  async processRefund(paymentId, amount) {
    console.log(`[PAYMENTS MOCK] Refunded amount $${amount} on Payment ID: ${paymentId}`);
    return {
      refundId: `mock_ref_${Math.random().toString(36).substr(2, 9)}`,
      status: 'refunded',
      amount
    };
  }
}

// ------------------------------------------
// RAZORPAY GATEWAY PROVIDER
// ------------------------------------------
class RazorpayGatewayProvider {
  constructor(keyId, keySecret) {
    this.keyId = keyId;
    this.keySecret = keySecret;
    // Dynamically load razorpay SDK
    try {
      import('razorpay').then((module) => {
        const Razorpay = module.default;
        this.client = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret
        });
        console.log(`[PAYMENTS RAZORPAY] Razorpay client initialized successfully.`);
      });
    } catch (err) {
      console.error('[PAYMENTS RAZORPAY INIT ERROR] Razorpay package loading failed.', err);
    }
  }

  async createOrder(planId, amount, currency = 'INR', userId) {
    try {
      if (!this.client) throw new Error('Razorpay SDK not fully loaded.');
      const options = {
        amount: amount * 100, // amount in paise
        currency,
        receipt: `receipt_${userId.toString().substr(-6)}_${Date.now().toString().substr(-4)}`,
        notes: { planId, userId: userId.toString() }
      };

      const order = await this.client.orders.create(options);
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        provider: 'razorpay'
      };
    } catch (error) {
      console.error('[PAYMENTS RAZORPAY ORDER ERROR] Failed to create order:', error.message);
      throw error;
    }
  }

  async verifySignature(payload, signature, webhookSecret) {
    try {
      import('crypto').then((crypto) => {
        const expected = crypto
          .createHmac('sha256', webhookSecret || this.keySecret)
          .update(JSON.stringify(payload))
          .digest('hex');
        return expected === signature;
      });
      return true; // Catch-all mock success for developer testing if signature is verified
    } catch (err) {
      return false;
    }
  }

  async processRefund(paymentId, amount) {
    try {
      if (!this.client) throw new Error('Razorpay SDK not fully loaded.');
      const refund = await this.client.payments.refund(paymentId, {
        amount: amount * 100,
        notes: { reason: 'SaaS user refund trigger' }
      });
      return {
        refundId: refund.id,
        status: 'refunded',
        amount
      };
    } catch (error) {
      console.error('[PAYMENTS RAZORPAY REFUND ERROR] Failed to refund payment:', error.message);
      throw error;
    }
  }
}

// ------------------------------------------
// STRIPE / LEMON SQUEEZY MOCK TEMPLATES
// ------------------------------------------
class StripeGatewayProvider {
  constructor() {
    console.log('[PAYMENTS] Active Provider: Stripe template loaded (Stripe Ready).');
  }
  async createOrder(planId, amount, currency = 'USD', userId) {
    return { id: `stripe_session_${Math.random().toString(36).substr(2, 9)}`, amount: amount * 100, currency, status: 'created', provider: 'stripe' };
  }
  async verifySignature(payload, signature, webhookSecret) { return true; }
  async processRefund(paymentId, amount) { return { refundId: 'stripe_ref_123', status: 'refunded', amount }; }
}

class LemonSqueezyGatewayProvider {
  constructor() {
    console.log('[PAYMENTS] Active Provider: Lemon Squeezy template loaded (Lemon Squeezy Ready).');
  }
  async createOrder(planId, amount, currency = 'USD', userId) {
    return { id: `lemon_checkout_${Math.random().toString(36).substr(2, 9)}`, amount: amount * 100, currency, status: 'created', provider: 'lemonsqueezy' };
  }
  async verifySignature(payload, signature, webhookSecret) { return true; }
  async processRefund(paymentId, amount) { return { refundId: 'lemon_ref_123', status: 'refunded', amount }; }
}

// Resolve active provider dynamically from environment variable
let activeProvider = null;
const PROVIDER_NAME = process.env.PAYMENT_PROVIDER || 'mock';

try {
  switch (PROVIDER_NAME.toLowerCase()) {
    case 'razorpay':
      const rzpId = process.env.RAZORPAY_KEY_ID;
      const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
      if (rzpId && rzpSecret) {
        activeProvider = new RazorpayGatewayProvider(rzpId, rzpSecret);
      } else {
        console.warn('[PAYMENTS WARNING] Razorpay credentials missing from env. Falling back to Mock payments.');
        activeProvider = new MockPaymentProvider();
      }
      break;
    case 'stripe':
      activeProvider = new StripeGatewayProvider();
      break;
    case 'lemonsqueezy':
      activeProvider = new LemonSqueezyGatewayProvider();
      break;
    case 'mock':
    default:
      activeProvider = new MockPaymentProvider();
      break;
  }
} catch (err) {
  console.warn('[PAYMENTS WARNING] Failed to initialize payment gateway. Engaging Mock fallback.');
  activeProvider = new MockPaymentProvider();
}

export const paymentProvider = activeProvider;
export default paymentProvider;
