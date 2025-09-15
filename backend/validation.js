import Joi from 'joi';

// Schemas
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const ticketSchema = Joi.object({
  title: Joi.string().trim().required(),
  eventName: Joi.string().trim().required(),
  eventDate: Joi.date().iso().required(),
  price: Joi.number().positive().required(),
  location: Joi.string().min(1).max(200).required(),
});

// Validation middleware
export const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
  }

  // Basic sanitization: trim all string fields
  for (const key of Object.keys(value)) {
    if (typeof value[key] === 'string') {
      value[key] = value[key].trim();
    }
  }

  req.body = value;
  next();
};

export const validateParamsId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid id parameter' });
  }
  next();
};
