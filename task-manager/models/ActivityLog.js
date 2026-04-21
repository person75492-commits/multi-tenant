const mongoose = require('mongoose');

const VALID_ACTIONS = ['create', 'update', 'delete'];

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: { values: VALID_ACTIONS, message: `Action must be one of: ${VALID_ACTIONS.join(', ')}` },
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
    },
  },
  {
    timestamps: true, // createdAt serves as the log timestamp — no separate field needed
  }
);

// Index for querying logs by task or user efficiently
activityLogSchema.index({ task_id: 1 });
activityLogSchema.index({ user_id: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
