'use strict';

const { Schema, model, Types } = require('mongoose');

const ACTIVITY_ACTIONS = [
  'file.upload',
  'file.download',
  'file.delete',
  'file.restore',
  'file.rename',
  'file.move',
  'file.star',
  'file.share',
  'folder.create',
  'folder.delete',
  'folder.rename',
  'ai.search',
  'ai.summarize',
  'ai.chat',
];

const activitySchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ACTIVITY_ACTIONS,
      required: true,
    },
    resourceId: {
      type: Types.ObjectId,
      default: null,
    },
    resourceType: {
      type: String,
      enum: ['file', 'folder', null],
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed, // { oldName, newName, shareToken, etc. }
      default: {},
    },
  },
  {
    timestamps: true,
    // Only store createdAt (activity is append-only)
    timestamps: { createdAt: 'timestamp', updatedAt: false },
  }
);

// Indexes
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ resourceId: 1, timestamp: -1 });
// TTL: auto-delete activities older than 90 days
activitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = model('Activity', activitySchema);
