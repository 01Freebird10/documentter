import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    plan: {
      type: String,
      required: true,
      enum: ['free', 'pro', 'team', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'canceled', 'past_due', 'trialing', 'incomplete'],
      default: 'active',
      index: true
    },
    price: {
      type: Number,
      required: true,
      default: 0
    },
    currency: {
      type: String,
      required: true,
      default: 'usd'
    },
    billingInterval: {
      type: String,
      enum: ['month', 'year', 'one-time'],
      default: 'month'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    stripeSubscriptionId: {
      type: String,
      default: ''
    },
    stripePriceId: {
      type: String,
      default: ''
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
