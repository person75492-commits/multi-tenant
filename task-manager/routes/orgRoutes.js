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

module.exports = router;
