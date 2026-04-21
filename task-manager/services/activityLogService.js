const ActivityLog = require('../models/ActivityLog');

const ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

/**
 * Writes an activity log entry. Failures are non-fatal —
 * logged to stderr so they never break the main request flow.
 */
const log = async ({ user_id, task_id, action }) => {
  try {
    await ActivityLog.create({ user_id, task_id, action });
  } catch (err) {
    console.error(`[ActivityLog] Failed to write log: ${err.message}`);
  }
};

module.exports = { log, ACTIONS };
