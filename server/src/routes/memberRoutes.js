const express = require('express');
const router = express.Router();
const {
  createMember,
  getMembers,
  getMemberById,
  getMemberTransactions,
} = require('../controllers/memberController');
const { recordPurchase } = require('../controllers/purchaseController');
const { redeemReward } = require('../controllers/rewardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All member routes require authentication

router.route('/')
  .get(getMembers)
  .post(createMember);

router.route('/:id')
  .get(getMemberById);

router.get('/:id/transactions', getMemberTransactions);
router.post('/:id/purchases', recordPurchase);
router.post('/:id/redeem', redeemReward);

module.exports = router;
