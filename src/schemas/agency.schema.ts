import Joi from "joi";

// Define the Joi schema for the Expert model
export const agencyExpertSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.number().required(),
  password: Joi.string().required(),
  agency: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  languages: Joi.array().items(Joi.string()),
  experience: Joi.number().required(),
  jobCategory: Joi.string().required(),
  expertise: Joi.array().items(Joi.string()),
  profilePhoto:Joi.string()
});
