const Task = require('../models/Task');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { assertOrgOwnership } = require('../middleware/tenantGuard');
const { log, ACTIONS } = require('./activityLogService');
const escapeRegex = require('../utils/escapeRegex');

const creatorId = (task) => task.created_by?._id ?? task.created_by;

const assertMutationAccess = (req, task) => {
  if (req.role === 'admin') return;
  if (creatorId(task).toString() !== req.user_id.toString()) {
    throw new AppError('Access Denied: you can only modify your own tasks.', 403);
  }
};

// Get all admin IDs in an org — admin tasks are visible to everyone
const getAdminIds = async (organization_id) => {
  const admins = await User.find({ organization_id, role: 'admin' }).select('_id');
  return admins.map((a) => a._id);
};

// ── Service methods ───────────────────────────────────────────

// Admin → all tasks in org | Member → all org tasks (but can only mutate own)
exports.getAllTasks = async (req) => {
  const page   = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip   = (page - 1) * limit;
  const search = req.query.search;

  // Admin → sees all org tasks
  // Member → sees own tasks + all admin-created tasks
  let filter;
  if (req.role === 'admin') {
    filter = { organization_id: req.organization_id };
  } else {
    const adminIds = await getAdminIds(req.organization_id);
    filter = {
      organization_id: req.organization_id,
      $or: [
        { created_by: req.user_id },          // own tasks
        { created_by: { $in: adminIds } },    // admin tasks (visible to all)
      ],
    };
  }

  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: 'i' };
  }

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  return {
    tasks,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// GET /tasks/:id
exports.getTask = async (req, taskId) => {
  const task = await Task.findById(taskId).populate('created_by', 'name email');
  if (!task) throw new AppError('Task not found.', 404);
  assertOrgOwnership(req, task.organization_id);

  if (req.role !== 'admin') {
    const adminIds = (await getAdminIds(req.organization_id)).map(String);
    const creator  = creatorId(task).toString();
    const isOwn    = creator === req.user_id.toString();
    const isAdmin  = adminIds.includes(creator);
    if (!isOwn && !isAdmin) throw new AppError('Task not found.', 404);
  }
  return task;
};

// POST /tasks
exports.createTask = async (req, data) => {
  const task = await Task.create({
    title:           data.title,
    description:     data.description,
    organization_id: req.organization_id,  // always from JWT — never from body
    created_by:      req.user_id,
  });

  await log({ user_id: req.user_id, task_id: task._id, action: ACTIONS.CREATE });
  return task;
};

// PUT /tasks/:id
exports.updateTask = async (req, taskId, data) => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError('Task not found.', 404);

  assertOrgOwnership(req, task.organization_id);
  // Both status and full edits require ownership for members
  assertMutationAccess(req, task);

  const updated = await Task.findByIdAndUpdate(
    taskId,
    {
      title:       data.title       ?? task.title,
      description: data.description ?? task.description,
      status:      data.status      ?? task.status,
    },
    { new: true, runValidators: true }
  ).populate('created_by', 'name email');

  await log({ user_id: req.user_id, task_id: taskId, action: ACTIONS.UPDATE });
  return updated;
};

// DELETE /tasks/:id
exports.deleteTask = async (req, taskId) => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError('Task not found.', 404);

  assertOrgOwnership(req, task.organization_id);
  assertMutationAccess(req, task);

  await task.deleteOne();
  await log({ user_id: req.user_id, task_id: taskId, action: ACTIONS.DELETE });
};
