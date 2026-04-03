'use strict';

const { Schema, model, Types } = require('mongoose');

const folderSchema = new Schema(
  {
    ownerId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [255, 'Folder name cannot exceed 255 characters'],
    },
    parentFolderId: {
      type: Types.ObjectId,
      ref: 'Folder',
      default: null, // null = root level
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    // TODO: Phase 3 — Add color/icon customization
    // color: { type: String },
    // icon: { type: String },
  },
  { timestamps: true }
);

// Indexes
folderSchema.index({ ownerId: 1, parentFolderId: 1, isDeleted: 1 });
folderSchema.index({ ownerId: 1, isDeleted: 1 });
folderSchema.index({ ownerId: 1, isStarred: 1, isDeleted: 1 });

module.exports = model('Folder', folderSchema);
