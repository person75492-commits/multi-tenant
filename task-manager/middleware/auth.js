const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/User');

exports.protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Not authenticated. Please log in.', 401));
  }

  const token = authHeader.split(' ')[1];

  // Verify signature + expiry — throws JsonWebTokenError / TokenExpiredError
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Source all sensitive fields from DB — never trust the JWT payload alone
  const user = await User.findById(decoded.user_id);
  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }

  // Detect token tampering — if decoded role doesn't match DB role, reject
  if (decoded.role && decoded.role !== user.role) {
    return next(new AppError('Token integrity check failed. Please log in again.', 401));
  }

  // Detect org tampering — if decoded org doesn't match DB org, reject
  if (decoded.organization_id &&
      decoded.organization_id.toString() !== user.organization_id.toString()) {
    return next(new AppError('Token integrity check failed. Please log in again.', 401));
  }

  // Attach everything to req.user for a single consistent access point.
  // Also keep top-level aliases for backwards compatibility with existing middleware.
  req.user = {
    ...user.toObject(),       // full Mongoose doc as plain object
    user_id:         user._id,
    role:            user.role,
    organization_id: user.organization_id,
  };

  // Top-level aliases — used by tenantGuard, rbac, taskService
  req.user_id         = user._id;
  req.role            = user.role;
  req.organization_id = user.organization_id;

  next();
});

exports.restrictTo = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.role)) {
      return next(new AppError('You do not have permission for this action.', 403));
    }
    next();
  };
