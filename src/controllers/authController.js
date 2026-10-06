const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) throw new AppError('Email already registered', 409);
  const user = await User.create({ name, email, password });
  res.status(201).json({
    success: true,
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  res.json({
    success: true,
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email },
  });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: { id: req.user._id, name: req.user.name, email: req.user.email } });
});
