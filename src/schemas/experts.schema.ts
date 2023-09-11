import Joi from 'joi';

// Define the Joi schema for the Expert model
const expertSchema = Joi.object({
  user: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  languages: Joi.array().items(Joi.string()),
  experience:Joi.number().required(),
  jobCategory: Joi.string().required(),
  expertise: Joi.array().items(Joi.string()),
});

export default expertSchema;
