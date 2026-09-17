/**
 * Points & Tier Rules Engine for BeanLedger Café Rewards
 * 
 * Rules:
 * - Regular: Lifetime Spend < $100 -> 1.0x earning multiplier
 * - Silver: Lifetime Spend $100 - $499.99 -> 1.5x earning multiplier
 * - Gold: Lifetime Spend $500 - $4999.99 -> 2.0x earning multiplier
 * - Platinum: Lifetime Spend >= $5000 -> 3.0x earning multiplier (0.3 points / unit)
 * 
 * Points Earned = Math.floor(Purchase Amount * Multiplier)
 */

const Transaction = require('../models/Transaction');
const Member = require('../models/Member');

const TIER_THRESHOLDS = {
  SILVER: 100,
  GOLD: 500,
  PLATINUM: 5000,
};

const TIER_MULTIPLIERS = {
  Regular: 1.0,
  Silver: 1.5,
  Gold: 2.0,
  Platinum: 3.0, // 0.3 / unit
};

/**
 * Determine deterministic member tier based on lifetime spend
 * @param {number} lifetimeSpend 
 * @returns {'Regular' | 'Silver' | 'Gold' | 'Platinum'}
 */
const calculateTier = (lifetimeSpend) => {
  const spend = Number(lifetimeSpend) || 0;
  if (spend >= TIER_THRESHOLDS.PLATINUM) {
    return 'Platinum';
  }
  if (spend >= TIER_THRESHOLDS.GOLD) {
    return 'Gold';
  }
  if (spend >= TIER_THRESHOLDS.SILVER) {
    return 'Silver';
  }
  return 'Regular';
};

/**
 * Get earning multiplier for a given tier
 * @param {string} tier 
 * @returns {number}
 */
const getEarningMultiplier = (tier) => {
  return TIER_MULTIPLIERS[tier] || 1.0;
};

/**
 * Calculate earned points for a purchase amount based on member tier
 * @param {number} purchaseAmount 
 * @param {string} currentTier 
 * @returns {number}
 */
const calculatePurchasePoints = (purchaseAmount, currentTier) => {
  const amount = Number(purchaseAmount) || 0;
  if (amount <= 0) return 0;
  
  const multiplier = getEarningMultiplier(currentTier);
  return Math.floor(amount * multiplier);
};

/**
 * Validate whether a member can redeem a reward
 * @param {number} memberBalance 
 * @param {number} rewardCost 
 * @returns {{ valid: boolean, message?: string }}
 */
const validateRedemption = (memberBalance, rewardCost) => {
  const balance = Number(memberBalance) || 0;
  const cost = Number(rewardCost) || 0;

  if (cost <= 0) {
    return { valid: false, message: 'Invalid reward cost' };
  }

  if (balance < cost) {
    return {
      valid: false,
      message: `Insufficient points for this reward. Member has ${balance} points, but ${cost} points are required.`,
    };
  }

  return { valid: true };
};

/**
 * Process 90-day points expiration using simulated or current date
 * @param {Date} currentDate 
 * @returns {Promise<{ expiredCount: number, pointsExpiredTotal: number, affectedMembers: number }>}
 */
const processPointsExpiration = async (currentDate = new Date()) => {
  const now = new Date(currentDate);
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

  // Find all purchase transactions with unredeemed points remaining
  const candidateTransactions = await Transaction.find({
    type: 'PURCHASE',
    remainingPoints: { $gt: 0 },
  });

  let expiredCount = 0;
  let pointsExpiredTotal = 0;
  const affectedMemberIds = new Set();

  for (const trans of candidateTransactions) {
    const ageMs = now.getTime() - new Date(trans.createdAt).getTime();

    if (ageMs >= ninetyDaysMs) {
      const pointsToExpire = trans.remainingPoints;
      trans.remainingPoints = 0;
      await trans.save();

      const member = await Member.findById(trans.memberId);
      if (member) {
        const newBalance = Math.max(0, member.pointsBalance - pointsToExpire);
        member.pointsBalance = newBalance;
        await member.save();

        await Transaction.create({
          memberId: member._id,
          type: 'EXPIRATION',
          amount: 0,
          points: -pointsToExpire,
          description: `Expired ${pointsToExpire} unredeemed points (>90 days old)`,
          balanceAfter: newBalance,
          createdAt: now,
        });

        affectedMemberIds.add(member._id.toString());
      }

      expiredCount++;
      pointsExpiredTotal += pointsToExpire;
    }
  }

  return {
    expiredCount,
    pointsExpiredTotal,
    affectedMembersCount: affectedMemberIds.size,
    simulatedDate: now.toISOString(),
  };
};

module.exports = {
  TIER_THRESHOLDS,
  TIER_MULTIPLIERS,
  calculateTier,
  getEarningMultiplier,
  calculatePurchasePoints,
  validateRedemption,
  processPointsExpiration,
};
