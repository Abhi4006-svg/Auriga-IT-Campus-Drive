const Member = require('../models/Member');
const Transaction = require('../models/Transaction');
const { calculateTier } = require('../services/pointsService');

// @desc    Register a new member
// @route   POST /api/members
// @access  Private (Staff)
const createMember = async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required',
      });
    }

    const cleanPhone = phone.trim();
    const existingMember = await Member.findOne({ phone: cleanPhone });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: `Member with phone number '${cleanPhone}' already exists`,
      });
    }

    const initialTier = calculateTier(0);

    const member = await Member.create({
      name: name.trim(),
      phone: cleanPhone,
      email: email ? email.trim() : '',
      pointsBalance: 0,
      tier: initialTier,
      lifetimeSpend: 0,
      lifetimePoints: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Member registered successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all members with search, pagination, and sorting
// @route   GET /api/members
// @access  Private (Staff)
const getMembers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim() : '';
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    // Whitelist allowed sorting fields to prevent unsafe query construction
    const allowedSortFields = ['name', 'phone', 'pointsBalance', 'tier', 'lifetimeSpend', 'createdAt'];
    const validSortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    let query = {};
    if (search) {
      // Search by phone or case-insensitive name
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query = {
        $or: [
          { phone: { $regex: searchRegex } },
          { name: { $regex: searchRegex } },
        ],
      };
    }

    const total = await Member.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    // If page exceeds total pages, auto-bound or return empty array gracefully
    const members = await Member.find(query)
      .sort({ [validSortField]: order })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        members,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get member details by ID
// @route   GET /api/members/:id
// @access  Private (Staff)
const getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction history for a member
// @route   GET /api/members/:id/transactions
// @access  Private (Staff)
const getMemberTransactions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const total = await Transaction.countDocuments({ memberId: id });
    const totalPages = Math.ceil(total / limit) || 1;

    const transactions = await Transaction.find({ memberId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  getMemberTransactions,
};
