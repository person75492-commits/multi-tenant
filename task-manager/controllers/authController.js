const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

const userShape = (user) => ({
  _id:             user._id,
  name:            user.name,
  email:           user.email,
  role:            user.role,
  organization_id: user.organization_id,
});

// POST /api/v1/auth/register/admin
// Creates a new organization + admin user. Returns invite code.
exports.registerAdmin = catchAsync(async (req, res) => {
  const { orgName, name, email, password } = req.body;
  const { user, organization, token } = await authService.registerAdmin({
    orgName, name, email, password,
  });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: userShape(user),
      organization: {
        _id:        organization._id,
        name:       organization.name,
        inviteCode: organization.inviteCode, // admin sees this to share with members
      },
    },
  });
});

// POST /api/v1/auth/register/member
// Joins an existing organization using an invite code.
exports.registerMember = catchAsync(async (req, res) => {
  const { inviteCode, name, email, password } = req.body;
  const { user, organization, token } = await authService.registerMember({
    inviteCode, name, email, password,
  });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: userShape(user),
      organization: {
        _id:  organization._id,
        name: organization.name,
        // invite code NOT returned to member
      },
    },
  });
});

// POST /api/v1/auth/login
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });

  res.status(200).json({
    status: 'success',
    token,
    data: { user: userShape(user) },
  });
});
