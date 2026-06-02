import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';
import UsageTracking from '../models/UsageTracking.js';
import { PLANS } from './paymentProvider.js';

/**
 * SaaS Subscription & Resource Quota Enforcement Service
 */
class SubscriptionService {
  
  /**
   * Activate or renew a SaaS plan subscription
   */
  async activateSubscription(userId, planId, paymentId, price, billingInterval = 'month') {
    const planConfig = PLANS[planId];
    if (!planConfig) {
      throw new Error(`Plan configuration not found for: ${planId}`);
    }

    const startDate = new Date();
    const endDate = new Date();
    
    if (billingInterval === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // 1. Upsert Mongoose Subscription record
    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        plan: planId,
        status: 'active',
        price,
        currency: 'usd',
        billingInterval,
        startDate,
        endDate,
        stripeSubscriptionId: paymentId
      },
      { upsert: true, new: true }
    );

    // 2. Update User credits & Plan parameters
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found on database.');

    const oldCredits = user.credits || 0;
    const additionalCredits = planConfig.credits;
    const newCredits = oldCredits + additionalCredits;

    user.plan = planId;
    user.credits = newCredits;
    await user.save();

    // 3. Log credit transaction welcome/top-up bonus
    await CreditTransaction.create({
      userId,
      amount: additionalCredits,
      balanceAfter: newCredits,
      type: 'topup',
      description: `SaaS plan activation credit top-up: ${planConfig.name}`
    });

    // 4. Initialize or reset Usage Tracking quotas
    await UsageTracking.findOneAndUpdate(
      { userId },
      {
        projectsAnalyzed: 0,
        reportsGenerated: 0,
        pdfGenerated: 0,
        pptGenerated: 0,
        aiRequestsCount: 0,
        repositoryChatUsage: 0,
        resetDate: endDate
      },
      { upsert: true, new: true }
    );

    console.log(`[SUBSCRIPTION SUCCESS] Activated Plan: "${planId}" for User: ${user.email}. Billed: $${price}. Loaded: ${additionalCredits} credits.`);
    return subscription;
  }

  /**
   * Consume user credits for a heavy operation
   */
  async consumeCredits(userId, requiredCredits, actionDescription, projectId = null) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found on database.');

    const currentBalance = user.credits || 0;
    if (currentBalance < requiredCredits) {
      throw new Error(`SaaS Credit violation: Operation requires ${requiredCredits} credits. Your balance is ${currentBalance}. Upgrade your plan or top-up!`);
    }

    const newBalance = currentBalance - requiredCredits;
    user.credits = newBalance;
    await user.save();

    // Log transaction
    const transaction = await CreditTransaction.create({
      userId,
      amount: -requiredCredits,
      balanceAfter: newBalance,
      type: 'deduction',
      description: actionDescription,
      projectId
    });

    console.log(`[CREDITS CONSUMED] Billed ${requiredCredits} credits to User ID: ${userId} for "${actionDescription}". New Balance: ${newBalance}`);
    return transaction;
  }

  /**
   * Increment resource quota usage and verify constraints
   */
  async checkAndIncrementUsage(userId, resourceType, limit) {
    let usage = await UsageTracking.findOne({ userId });
    if (!usage) {
      usage = await UsageTracking.create({ userId });
    }

    // Auto Quota Resets if resetDate exceeded
    if (usage.resetDate && usage.resetDate < new Date()) {
      usage[resourceType] = 0;
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      usage.resetDate = nextMonth;
      await usage.save();
    }

    const currentUsage = usage[resourceType] || 0;
    if (limit !== -1 && currentUsage >= limit) {
      throw new Error(`Quota Limit Reached: You have consumed all your plan allowances for ${resourceType} (${currentUsage}/${limit}). Upgrade your plan to increase limits.`);
    }

    // Safely increment
    usage[resourceType] = currentUsage + 1;
    await usage.save();
    return true;
  }

  /**
   * Dynamic helper resolving user limits based on Plan tier
   */
  async enforceQuotas(userId, actionType) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found.');

    const plan = user.plan || 'free';
    
    // Limits specifications
    let limits = { projects: 3, reports: 3, pdf: 3, ppt: 1, ai: 10, chat: 0 }; // Free Plan limits
    
    if (plan === 'pro') {
      limits = { projects: -1, reports: -1, pdf: -1, ppt: -1, ai: 1000, chat: -1 }; // Pro Unlimited
    } else if (plan === 'team') {
      limits = { projects: -1, reports: -1, pdf: -1, ppt: -1, ai: 5000, chat: -1 }; // Team Multi slots
    } else if (plan === 'enterprise') {
      limits = { projects: -1, reports: -1, pdf: -1, ppt: -1, ai: -1, chat: -1 }; // Enterprise Unlimited
    }

    switch (actionType) {
      case 'projectsAnalyzed':
        return await this.checkAndIncrementUsage(userId, 'projectsAnalyzed', limits.projects);
      case 'reportsGenerated':
        return await this.checkAndIncrementUsage(userId, 'reportsGenerated', limits.reports);
      case 'pdfGenerated':
        return await this.checkAndIncrementUsage(userId, 'pdfGenerated', limits.pdf);
      case 'pptGenerated':
        return await this.checkAndIncrementUsage(userId, 'pptGenerated', limits.ppt);
      case 'aiRequestsCount':
        return await this.checkAndIncrementUsage(userId, 'aiRequestsCount', limits.ai);
      case 'repositoryChatUsage':
        if (limits.chat === 0) throw new Error('Repository Chat is a premium Pro feature. Please upgrade your plan to unlock.');
        return await this.checkAndIncrementUsage(userId, 'repositoryChatUsage', limits.chat);
      default:
        return true;
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
