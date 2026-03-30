'use strict';

/**
 * Wraps async route handlers to automatically catch errors and pass them to the Express next() middleware.
 * This eliminates the need for try-catch blocks in every controller.
 * 
 * @param {Function} fn - The async Express route handler function
 * @returns {Function} - Wrapped Express route handler
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
