const mongoose = require('mongoose');
const crypto = require('crypto');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      unique: true,
    },
    inviteCode: {
      type: String,
      unique: true,
      // Generated automatically on creation
    },
  },
  { timestamps: true }
);

// Auto-generate a cryptographically secure 32-char invite token before saving
organizationSchema.pre('save', function (next) {
  if (!this.inviteCode) {
    // 16 random bytes → 32 hex chars
    // Entropy: 2^128 — computationally infeasible to brute-force
    this.inviteCode = crypto.randomBytes(16).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Organization', organizationSchema);
