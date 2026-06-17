const jwt = require('jsonwebtoken');
const Business = require('../models/Business');

exports.auth = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const business = await Business
      .findById(decoded.id)
      .select('-password');

    if (!business) {
      return res.status(401).json({
        message: 'Account not found',
      });
    }

    if (business.deletedAt) {
      return res.status(403).json({
        message: 'Account deleted',
      });
    }

    // ─── Check if admin disabled the account ──────────────────
    if (business.status !== 'active') {
      return res.status(403).json({
        message: 'Account disabled by admin',
        code: 'ACCOUNT_DISABLED',
      });
    }

    // ─── Check subscription expiry ────────────────────────────
    // Set isReadOnly flag for expired subscriptions
    const isExpired = business.subscriptionEndDate &&
      new Date() > new Date(business.subscriptionEndDate);

    if (isExpired && business.role !== 'superadmin') {
      req.isReadOnly = true;
      req.readOnlyMessage = 'Subscription expired. Read-only mode.';
    } else {
      req.isReadOnly = false;
    }

    req.business = business;
    next();

  } catch (e) {
    console.error('Auth error:', e);
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
};