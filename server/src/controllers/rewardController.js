const Reward = require('../models/Reward');
const Member = require('../models/Member');
const Transaction = require('../models/Transaction');
const { validateRedemption } = require('../services/pointsService');

// @desc    Get all active rewards
// @route   GET /api/rewards
// @access  Public / Staff
const getRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find({ active: true }).sort({ pointsCost: 1 });
    res.json({
      success: true,
      data: rewards,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new reward
// @route   POST /api/rewards
// @access  Private (Staff/Admin)
const createReward = async (req, res, next) => {
  try {
    const { name, description, pointsCost } = req.body;

    if (!name || !pointsCost) {
      return res.status(400).json({
        success: false,
        message: 'Reward name and points cost are required',
      });
    }

    const reward = await Reward.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      pointsCost: Number(pointsCost),
    });

    res.status(201).json({
      success: true,
      message: 'Reward created successfully',
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Redeem a reward for a member
// @route   POST /api/members/:id/redeem
// @access  Private (Staff)
const redeemReward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json({
        success: false,
        message: 'Reward ID is required',
      });
    }

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found',
      });
    }

    if (!reward.active) {
      return res.status(400).json({
        success: false,
        message: 'This reward is currently inactive',
      });
    }

    // Server-side validation of point balance
    const validation = validateRedemption(member.pointsBalance, reward.pointsCost);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // Execute atomic balance deduction
    const updatedBalance = member.pointsBalance - reward.pointsCost;
    member.pointsBalance = updatedBalance;
    await member.save();

    // Audit log transaction
    const transaction = await Transaction.create({
      memberId: member._id,
      type: 'REDEMPTION',
      amount: reward.pointsCost,
      points: -reward.pointsCost,
      description: `Redeemed reward: ${reward.name}`,
      balanceAfter: updatedBalance,
      createdBy: req.user ? req.user._id : null,
    });

    res.status(200).json({
      success: true,
      message: `Successfully redeemed '${reward.name}'`,
      data: {
        member: {
          _id: member._id,
          name: member.name,
          phone: member.phone,
          pointsBalance: member.pointsBalance,
          tier: member.tier,
        },
        reward: {
          _id: reward._id,
          name: reward.name,
          pointsCost: reward.pointsCost,
        },
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRewards,
  createReward,
  redeemReward,
};
