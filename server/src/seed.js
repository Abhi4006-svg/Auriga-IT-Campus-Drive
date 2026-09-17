require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Member = require('./models/Member');
const Reward = require('./models/Reward');
const Transaction = require('./models/Transaction');
const { calculateTier, getEarningMultiplier, calculatePurchasePoints } = require('./services/pointsService');

const seedData = async () => {
  console.log('[Seed] Initializing BeanLedger database seeding...');
  await connectDB();

  // Clean existing collections
  await User.deleteMany({});
  await Member.deleteMany({});
  await Reward.deleteMany({});
  await Transaction.deleteMany({});
  console.log('[Seed] Cleared existing database records.');

  // 1. Create Demo Staff User
  const staffUser = await User.create({
    name: 'Alex Rivera (Barista Lead)',
    email: 'staff@beanledger.com',
    passwordHash: 'password123',
    role: 'staff',
  });
  console.log('[Seed] Created demo staff user: staff@beanledger.com / password123');

  // 2. Create Rewards Catalog
  const rewardsData = [
    {
      name: 'Free Regular Coffee / Espresso',
      description: 'Single origin drip coffee or double espresso shot',
      pointsCost: 100,
      active: true,
    },
    {
      name: 'Specialty Latte or Cappuccino',
      description: 'Handcrafted latte with oat or almond milk choice',
      pointsCost: 150,
      active: true,
    },
    {
      name: 'Fresh Artisan Bakery Pastry',
      description: 'Flaky croissant, chocolate muffin, or blueberry scone',
      pointsCost: 180,
      active: true,
    },
    {
      name: 'Gourmet Breakfast Sandwich',
      description: 'Avocado, egg, and cheddar on brioche bun',
      pointsCost: 250,
      active: true,
    },
    {
      name: 'BeanLedger Commuter Tumbler',
      description: 'Stainless steel 16oz insulated travel mug',
      pointsCost: 400,
      active: true,
    },
  ];

  const rewards = await Reward.insertMany(rewardsData);
  console.log(`[Seed] Created ${rewards.length} reward items.`);

  // 3. Create 18 Members across Regular, Silver, and Gold tiers
  const rawMembers = [
    { name: 'Sarah Jenkins', phone: '9876543210', email: 'sarah.j@example.com', targetSpend: 45 },
    { name: 'David Miller', phone: '9876543211', email: 'david.m@example.com', targetSpend: 85 },
    { name: 'Elena Rostova', phone: '9876543212', email: 'elena.r@example.com', targetSpend: 135 },
    { name: 'Marcus Vance', phone: '9876543213', email: 'marcus.v@example.com', targetSpend: 240 },
    { name: 'Chloe Zhao', phone: '9876543214', email: 'chloe.z@example.com', targetSpend: 310 },
    { name: 'James Wilson', phone: '9876543215', email: 'james.w@example.com', targetSpend: 480 },
    { name: 'Amira Patel', phone: '9876543216', email: 'amira.p@example.com', targetSpend: 520 },
    { name: 'Lucas Scott', phone: '9876543217', email: 'lucas.s@example.com', targetSpend: 680 },
    { name: 'Sophia Martinez', phone: '9876543218', email: 'sophia.m@example.com', targetSpend: 890 },
    { name: 'Liam O\'Connor', phone: '9876543219', email: 'liam.o@example.com', targetSpend: 15 },
    { name: 'Hannah Abbott', phone: '9876543220', email: 'hannah.a@example.com', targetSpend: 160 },
    { name: 'Benjamin Hayes', phone: '9876543221', email: 'benjamin.h@example.com', targetSpend: 750 },
    { name: 'Grace Kim', phone: '9876543222', email: 'grace.k@example.com', targetSpend: 290 },
    { name: 'Noah Taylor', phone: '9876543223', email: 'noah.t@example.com', targetSpend: 90 },
    { name: 'Emma Watson', phone: '9876543224', email: 'emma.w@example.com', targetSpend: 410 },
    { name: 'Alexander Wright', phone: '9876543225', email: 'alex.w@example.com', targetSpend: 590 },
    { name: 'Mia Thomas', phone: '9876543226', email: 'mia.t@example.com', targetSpend: 30 },
    { name: 'Ethan Garcia', phone: '9876543227', email: 'ethan.g@example.com', targetSpend: 110 },
    { name: 'Victoria Sterling', phone: '9876543299', email: 'victoria.s@example.com', targetSpend: 5400 },
  ];

  for (const mData of rawMembers) {
    // Calculate initial tier based on spend
    const tier = calculateTier(mData.targetSpend);
    const multiplier = getEarningMultiplier(tier);
    const pointsEarned = calculatePurchasePoints(mData.targetSpend, tier);

    const member = await Member.create({
      name: mData.name,
      phone: mData.phone,
      email: mData.email,
      lifetimeSpend: mData.targetSpend,
      lifetimePoints: pointsEarned,
      pointsBalance: pointsEarned,
      tier,
    });

    // Create an initial purchase transaction record
    await Transaction.create({
      memberId: member._id,
      type: 'PURCHASE',
      amount: mData.targetSpend,
      points: pointsEarned,
      description: `Initial purchase of $${mData.targetSpend.toFixed(2)} (${tier} tier - ${multiplier}x points)`,
      balanceAfter: pointsEarned,
      createdBy: staffUser._id,
    });
  }

  // Create a redemption sample for Gold member Amira Patel
  const amira = await Member.findOne({ phone: '9876543216' });
  if (amira) {
    const rewardToRedeem = rewards[1]; // Specialty Latte (150 pts)
    if (amira.pointsBalance >= rewardToRedeem.pointsCost) {
      amira.pointsBalance -= rewardToRedeem.pointsCost;
      await amira.save();

      await Transaction.create({
        memberId: amira._id,
        type: 'REDEMPTION',
        amount: rewardToRedeem.pointsCost,
        points: -rewardToRedeem.pointsCost,
        description: `Redeemed reward: ${rewardToRedeem.name}`,
        balanceAfter: amira.pointsBalance,
        createdBy: staffUser._id,
      });
    }
  }

  console.log('[Seed] Successfully seeded demo members and transactions!');
  console.log('[Seed] Finished successfully.');
  process.exit(0);
};

seedData().catch((err) => {
  console.error('[Seed] Error during database seeding:', err);
  process.exit(1);
});
