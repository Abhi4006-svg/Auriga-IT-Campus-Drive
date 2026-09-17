const Member = require('../models/Member');
const Transaction = require('../models/Transaction');
const Outbox = require('../models/Outbox');
const {
  calculateTier,
  getEarningMultiplier,
  calculatePurchasePoints,
} = require('../services/pointsService');

// @desc    Record a member purchase and issue points
// @route   POST /api/members/:id/purchases
// @access  Private (Staff)
const recordPurchase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, description } = req.body;

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Purchase amount must be a positive number greater than 0',
      });
    }

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    // 1. Calculate points earned using member's current tier multiplier
    const currentTier = member.tier;
    const multiplier = getEarningMultiplier(currentTier);
    const pointsEarned = calculatePurchasePoints(numericAmount, currentTier);

    // 2. Update member stats & recalculate tier
    const updatedLifetimeSpend = Number((member.lifetimeSpend + numericAmount).toFixed(2));
    const updatedLifetimePoints = member.lifetimePoints + pointsEarned;
    const updatedBalance = member.pointsBalance + pointsEarned;
    const newTier = calculateTier(updatedLifetimeSpend);

    const isTierUpgraded = newTier !== currentTier;

    member.lifetimeSpend = updatedLifetimeSpend;
    member.lifetimePoints = updatedLifetimePoints;
    member.pointsBalance = updatedBalance;
    member.tier = newTier;

    await member.save();

    // 3. Log transaction audit trail with remaining points for 90-day expiration
    const transaction = await Transaction.create({
      memberId: member._id,
      type: 'PURCHASE',
      amount: numericAmount,
      points: pointsEarned,
      remainingPoints: pointsEarned,
      description: description ? description.trim() : `Purchase of $${numericAmount.toFixed(2)}`,
      balanceAfter: updatedBalance,
      createdBy: req.user ? req.user._id : null,
    });

    // 4. Level 3 Twist: If member crossed into a new tier, push event to Notification Outbox
    let outboxEvent = null;
    if (isTierUpgraded) {
      outboxEvent = await Outbox.create({
        memberId: member._id,
        memberName: member.name,
        phone: member.phone,
        event: 'TIER_UPGRADE',
        oldTier: currentTier,
        newTier: newTier,
        message: `Congratulations ${member.name}! You have been promoted to ${newTier} Tier status.`,
        status: 'PENDING',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Purchase recorded successfully',
      data: {
        member: {
          _id: member._id,
          name: member.name,
          phone: member.phone,
          pointsBalance: member.pointsBalance,
          tier: member.tier,
          lifetimeSpend: member.lifetimeSpend,
          lifetimePoints: member.lifetimePoints,
        },
        purchaseSummary: {
          amount: numericAmount,
          tierUsed: currentTier,
          earningMultiplier: multiplier,
          pointsEarned,
          newBalance: updatedBalance,
          promotedTier: isTierUpgraded ? newTier : null,
        },
        transaction,
        outboxEvent,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordPurchase,
};
