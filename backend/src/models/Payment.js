import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      index: true
    },
    planId: {
      type: String,
      required: true,
      enum: ['free', 'pro', 'team', 'enterprise'],
      default: 'pro'
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    paymentId: {
      type: String,
      default: ''
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true,
      default: 'usd',
      lowercase: true
    },
    provider: {
      type: String,
      required: true,
      enum: ['razorpay', 'stripe', 'lemonsqueezy', 'mock'],
      default: 'mock'
    },
    status: {
      type: String,
      required: true,
      enum: ['created', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true
    },
    signature: {
      type: String,
      default: ''
    },
    errorMessage: {
      type: String,
      default: ''
    },
    refundedAmount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
