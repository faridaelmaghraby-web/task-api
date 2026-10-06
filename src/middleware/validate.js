const Joi = require('joi');
const AppError = require('../utils/AppError');

// Validates req[source] against a Joi schema and replaces it with the sanitized value
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => ({ field: d.path.join('.'), message: d.message.replace(/"/g, '') }));
    return next(new AppError('Validation failed', 400, details));
  }
  if (source === 'query') {
    Object.defineProperty(req, 'query', { value, writable: true, configurable: true });
  } else {
    req[source] = value;
  }
  next();
};

const schemas = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(6).max(72).required(),
  }),
  login: Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required(),
  }),
  createTask: Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    description: Joi.string().trim().max(1000).allow(''),
    status: Joi.string().valid('pending', 'in-progress', 'completed'),
  }),
  updateTask: Joi.object({
    title: Joi.string().trim().min(3).max(100),
    description: Joi.string().trim().max(1000).allow(''),
    status: Joi.string().valid('pending', 'in-progress', 'completed'),
  }).min(1),
  listTasks: Joi.object({
    status: Joi.string().valid('pending', 'in-progress', 'completed'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('createdAt', '-createdAt', 'title', '-title').default('-createdAt'),
  }),
};

module.exports = { validate, schemas };
