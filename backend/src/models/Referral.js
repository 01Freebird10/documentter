import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    invitees: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['signed_up', 'subscribed'], default: 'signed_up' },
        registeredAt: { type: Date, default: Date.now }
      }
    ],
    discountPercent: {
      type: Number,
      default: 10 // 10% discount on purchase for invitee
    },
    referredCreditsReward: {
      type: Number,
      default: 20 // 20 credits awarded to referrer
    },
    studentVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Auto generate uppercase uppercase alphanumeric code if blank
referralSchema.pre('validate', function (next) {
  if (this.referralCode) return next();
  this.referralCode = 'MIND-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  next();
});

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;
