'use strict';

const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Never return password in queries by default
    },
    storageUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    storageQuota: {
      type: Number,
      default: function () {
        return (parseInt(process.env.DEFAULT_STORAGE_QUOTA_GB) || 15) * 1024 * 1024 * 1024; // bytes
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // TODO: Add avatar URL (Phase 3)
    // avatarUrl: { type: String },
    // TODO: Add OAuth provider fields (Phase 4+)
    // provider: { type: String, enum: ['local', 'google'], default: 'local' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });

module.exports = model('User', userSchema);
