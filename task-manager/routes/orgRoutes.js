const express = require('express');
const Organization = require('../models/Organization');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/rbac');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

router.use(protect);

// GET /api/v1/org/invite-code — admin only
// Returns the invite code for the admin's organization
router.get('/invite-code', adminOnly, catchAsync(async (req, res) => {
  const org = await Organization.findById(req.organization_id);
  res.json({
    status: 'success',
    data: {
      orgName:    org.name,
      inviteCode: org.inviteCode,
    },
  });
}));

// GET /api/v1/org/members — admin only
// Returns all members in the organization for assignee dropdown
router.get('/members', adminOnly, catchAsync(async (req, res) => {
  const User = require('../models/User');
  const members = await User.find({
    organization_id: req.organization_id,
    role: 'member',
  }).select('_id name email');
  res.json({ status: 'success', data: { members } });
}));

module.exports = router;
