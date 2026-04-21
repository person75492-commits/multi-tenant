const taskService = require('../services/taskService');
const catchAsync = require('../utils/catchAsync');

// GET /tasks — admin: all org tasks | member: own tasks only
exports.getAll = catchAsync(async (req, res) => {
  const { tasks, pagination } = await taskService.getAllTasks(req);
  res.status(200).json({ status: 'success', pagination, results: tasks.length, data: { tasks } });
});

// GET /tasks/:id
exports.getOne = catchAsync(async (req, res) => {
  const task = await taskService.getTask(req, req.params.id);
  res.status(200).json({ status: 'success', data: { task } });
});

// POST /tasks
exports.create = catchAsync(async (req, res) => {
  const task = await taskService.createTask(req, req.body);
  res.status(201).json({ status: 'success', data: { task } });
});

// PUT /tasks/:id
exports.update = catchAsync(async (req, res) => {
  const task = await taskService.updateTask(req, req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { task } });
});

// DELETE /tasks/:id
exports.delete = catchAsync(async (req, res) => {
  await taskService.deleteTask(req, req.params.id);
  res.status(200).json({ status: 'success', message: 'Task deleted successfully.' });
});
