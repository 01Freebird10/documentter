import Referral from '../models/Referral.js';
import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';

class ReferralService {
  
  /**
   * Initialize a referral code ledger for a user
   */
  async createReferralLedger(referrerId, customCode = '') {
    const code = customCode ? customCode.trim().toUpperCase() : 'MIND-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const referral = await Referral.findOneAndUpdate(
      { referrerId },
      { referralCode: code },
      { upsert: true, new: true }
    );
    
    console.log(`[REFERRAL GENERATOR] Created referral code: ${code} for Referrer: ${referrerId}`);
    return referral;
  }

  /**
   * Process a referred sign-up event, rewarding the referrer
   */
  async processSignupReferral(inviteeId, code) {
    if (!code) return null;

    const referral = await Referral.findOne({ referralCode: code.toUpperCase() });
    if (!referral) return null;

    // Avoid self-referrals
    if (referral.referrerId.toString() === inviteeId.toString()) {
      console.warn('[REFERRAL WARNING] Self referral attempts blocked.');
      return null;
    }

    // Check if invitee is already listed
    const alreadyLinked = referral.invitees.some(inv => inv.userId.toString() === inviteeId.toString());
    if (alreadyLinked) return referral;

    // Link invitee
    referral.invitees.push({
      userId: inviteeId,
      status: 'signed_up',
      registeredAt: new Date()
    });
    await referral.save();

    // Reward the referrer with credit bonuses
    const referrer = await User.findById(referral.referrerId);
    if (referrer) {
      const oldCredits = referrer.credits || 0;
      const reward = referral.referredCreditsReward;
      const newCredits = oldCredits + reward;
      
      referrer.credits = newCredits;
      await referrer.save();

      // Log credit transaction audit
      await CreditTransaction.create({
        userId: referral.referrerId,
        amount: reward,
        balanceAfter: newCredits,
        type: 'referral_bonus',
        description: `Affiliate invite signup bonus reward for code: ${referral.referralCode}`
      });

      console.log(`[REFERRAL SUCCESS] Rewarded Referrer: ${referrer.email} with +${reward} credits. Invite code: ${referral.referralCode}`);
    }

    return referral;
  }

  /**
   * Resolve pricing discount based on dynamic coupon and promo code matrices
   */
  async calculateDiscount(basePrice, couponCode) {
    if (!couponCode) {
      return { finalPrice: basePrice, discountAmount: 0, percentage: 0 };
    }

    const code = couponCode.trim().toUpperCase();
    let percentage = 0;

    // Static coupons
    if (code === 'STUDENT20') {
      percentage = 20; // 20% Student Discount
    } else if (code === 'PROMO50') {
      percentage = 50; // 50% Promotional Discount
    } else if (code.startsWith('MIND-')) {
      // Invite code applied during checkout yields 10% discount to invitee
      const referralExists = await Referral.findOne({ referralCode: code });
      if (referralExists) {
        percentage = referralExists.discountPercent || 10;
      }
    }

    if (percentage === 0) {
      return { finalPrice: basePrice, discountAmount: 0, percentage: 0, error: 'Invalid or expired coupon code.' };
    }

    const discountAmount = parseFloat(((basePrice * percentage) / 100).toFixed(2));
    const finalPrice = parseFloat((basePrice - discountAmount).toFixed(2));

    console.log(`[COUPONS] Applied code: "${code}" (${percentage}% off). Base: $${basePrice}, Discount: $${discountAmount}, Final: $${finalPrice}`);
    return { finalPrice, discountAmount, percentage };
  }
}

export const referralService = new ReferralService();
export default referralService;
