'use strict';

const { Schema, model, Types } = require('mongoose');

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4', 'video/webm',
  'audio/mpeg', 'audio/wav',
  // TODO: Extend allowlist as needed (Phase 1)
];

const fileSchema = new Schema(
  {
    ownerId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    folderId: {
      type: Types.ObjectId,
      ref: 'Folder',
      default: null, // null = root level
    },
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
      maxlength: [255, 'File name cannot exceed 255 characters'],
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    mimeType: {
      type: String,
      required: true,
      // TODO: Uncomment to enforce strict allowlist
      // enum: ALLOWED_MIME_TYPES,
    },
    // Cloudflare R2 object key — NEVER expose this directly to clients
    r2Key: {
      type: String,
      required: true,
      select: false, // Hidden from API responses; generate signed URLs instead
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    // ── AI Fields (populated by background workers in Phase 2) ──────────────
    textContent: {
      type: String,
      select: false, // Large field; only fetch when needed
      // TODO: Phase 2 — populated by text extraction worker
    },
    summary: {
      type: String,
      // TODO: Phase 2 — populated by AI summarization service
    },
    tags: {
      type: [String],
      default: [],
      // TODO: Phase 2 — populated by AI auto-tagger
    },
    hasPII: {
      type: Boolean,
      default: false,
      // TODO: Phase 3 — populated by PII detection service
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'done', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
fileSchema.index({ ownerId: 1, folderId: 1, isDeleted: 1 });
fileSchema.index({ ownerId: 1, isStarred: 1 });
fileSchema.index({ ownerId: 1, isDeleted: 1, deletedAt: 1 });
fileSchema.index({ ownerId: 1, updatedAt: -1 });

module.exports = model('File', fileSchema);
