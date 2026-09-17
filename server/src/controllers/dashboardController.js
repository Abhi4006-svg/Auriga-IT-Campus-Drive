const Member = require('../models/Member');
const Transaction = require('../models/Transaction');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/stats
// @access  Private (Staff)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalMembers = await Member.countDocuments();

    // Calculate start of today (00:00:00.000)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Today's Purchases
    const todayPurchases = await Transaction.find({
      type: 'PURCHASE',
      createdAt: { $gte: startOfToday },
    });

    const todayPurchasesCount = todayPurchases.length;
    const todayPurchasesAmount = todayPurchases.reduce((acc, t) => acc + (t.amount || 0), 0);
    const pointsIssuedToday = todayPurchases.reduce((acc, t) => acc + (t.points || 0), 0);

    // Today's Redemptions
    const todayRedemptions = await Transaction.find({
      type: 'REDEMPTION',
      createdAt: { $gte: startOfToday },
    });

    const todayRedemptionsCount = todayRedemptions.length;
    const pointsRedeemedToday = todayRedemptions.reduce((acc, t) => acc + Math.abs(t.points || 0), 0);

    res.json({
      success: true,
      data: {
        totalMembers,
        todaysPurchasesCount: todayPurchasesCount,
        todaysPurchasesAmount: Number(todayPurchasesAmount.toFixed(2)),
        pointsIssuedToday,
        todaysRedemptionsCount: todayRedemptionsCount,
        pointsRedeemedToday,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
