'use strict';

const { Schema, model, Types } = require('mongoose');

/**
 * Embedding model — stores vector chunks for a file.
 * Used by MongoDB Atlas Vector Search for semantic search (Phase 2).
 *
 * TODO Phase 2:
 *  - Add Atlas Vector Search index on the `vector` field via Atlas UI or CLI
 *  - Consider migrating to Qdrant/Pinecone if embeddings exceed 1M documents
 */
const embeddingSchema = new Schema(
  {
    fileId: {
      type: Types.ObjectId,
      ref: 'File',
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    text: {
      type: String,
      required: true,
    },
    vector: {
      type: [Number], // Float array — 768 dims for all-MiniLM, 1536 for OpenAI
      required: true,
      // TODO: Add validation for vector dimension consistency
    },
    model: {
      type: String,
      default: 'all-MiniLM-L6-v2', // Track which embedding model was used
    },
  },
  { timestamps: true }
);

// Indexes
embeddingSchema.index({ fileId: 1 });
embeddingSchema.index({ fileId: 1, chunkIndex: 1 }, { unique: true });
// TODO Phase 2: Create Atlas Vector Search index on `vector` via:
//   db.embeddings.createSearchIndex({ name: "vector_index", type: "vectorSearch", ... })

module.exports = model('Embedding', embeddingSchema);
