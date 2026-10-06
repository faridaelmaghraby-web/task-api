const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Provide a Bearer token.', 401);
  }
  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT errors handled globally
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('The user for this token no longer exists.', 401);
  req.user = user;
  next();
});
