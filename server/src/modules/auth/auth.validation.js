'use strict';

const { z } = require('zod');

/**
 * Middleware factory that validates req.body against a Zod schema
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(', ');
    return res.status(400).json({ success: false, message });
  }
  req.body = result.data; // use parsed + coerced values
  next();
};

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

module.exports = { validate, registerSchema, loginSchema };
