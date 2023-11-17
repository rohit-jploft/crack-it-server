import Joi from 'joi';

const expertRatingSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  expert: Joi.string().required(), // Assuming 'expert' and 'ratedBy' are strings in Joi
  ratedBy: Joi.string().required(),
  comment: Joi.string().allow("").default(''), // Assuming 'comment' is a string in Joi
})

export default expertRatingSchema;
