'use strict';

const { Schema, model, Types } = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const shareSchema = new Schema(
  {
    resourceId: {
      type: Types.ObjectId,
      required: true,
      // Polymorphic — can ref File or Folder
    },
    resourceType: {
      type: String,
      enum: ['file', 'folder'],
      required: true,
    },
    permission: {
      type: String,
      enum: ['viewer', 'editor'],
      default: 'viewer',
    },
    linkToken: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: null, // null = no expiry
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
shareSchema.index({ linkToken: 1 }, { unique: true });
shareSchema.index({ resourceId: 1, resourceType: 1 });
shareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL: auto-clean expired shares

module.exports = model('Share', shareSchema);
