const Joi = require('joi');

export const contactJoiSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  message: Joi.string().required(),
  // Add validation rules for other fields here
});


