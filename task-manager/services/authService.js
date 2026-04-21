const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const AppError = require('../utils/AppError');

const signToken = ({ user_id, role, organization_id }) =>
  jwt.sign(
    { user_id, role, organization_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

exports.issueToken = (user) =>
  signToken({
    user_id: user._id,
    role: user.role,
    organization_id: user.organization_id,
  });

// ── Admin registration ────────────────────────────────────────
// Creates a new organization and the first admin user.
// Returns the invite code so the admin can share it with members.
exports.registerAdmin = async ({ orgName, name, email, password }) => {
  // Org name must be unique — DB index rejects duplicates → 409
  const organization = await Organization.create({ name: orgName.trim() });

  const user = await User.create({
    name,
    email,
    password,
    role: 'admin',
    organization_id: organization._id,
  });

  const token = signToken({
    user_id: user._id,
    role: user.role,
    organization_id: organization._id,
  });

  return { user, organization, token };
};

// ── Member registration ───────────────────────────────────────
// Member must provide a valid invite code issued by an admin.
// They are automatically assigned to that organization as a member.
exports.registerMember = async ({ inviteCode, name, email, password }) => {
  const organization = await Organization.findOne({
    inviteCode: inviteCode.trim().toUpperCase(),
  });

  if (!organization) {
    throw new AppError('Invalid invite code. Ask your admin for the correct code.', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'member',
    organization_id: organization._id,
  });

  const token = signToken({
    user_id: user._id,
    role: user.role,
    organization_id: organization._id,
  });

  return { user, organization, token };
};

// ── Login ─────────────────────────────────────────────────────
exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !user.password) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = signToken({
    user_id: user._id,
    role: user.role,
    organization_id: user.organization_id,
  });

  return { user, token };
};
