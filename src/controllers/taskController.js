const Task = require('../models/Task');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const findOwned = async (id, userId) => {
  const task = await Task.findOne({ _id: id, owner: userId });
  if (!task) throw new AppError('Task not found', 404);
  return task;
};

exports.createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ success: true, data: task });
});

exports.getTasks = asyncHandler(async (req, res) => {
  const { status, page, limit, sort } = req.query;
  const filter = { owner: req.user._id, ...(status && { status }) };
  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Task.countDocuments(filter),
  ]);
  res.json({
    success: true,
    count: tasks.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: tasks,
  });
});

exports.getTask = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await findOwned(req.params.id, req.user._id) });
});

exports.updateTask = asyncHandler(async (req, res) => {
  const task = await findOwned(req.params.id, req.user._id);
  Object.assign(task, req.body);
  await task.save(); // runs schema validators
  res.json({ success: true, data: task });
});

exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await findOwned(req.params.id, req.user._id);
  await task.deleteOne();
  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});
