import Joi from 'joi';

const withdrawalRequestSchema = Joi.object({
  user: Joi.string().required(), // Assuming user is represented by a string (e.g., user ID)
  amount: Joi.number().positive().required(),
  status: Joi.string().valid('Pending', 'Approved', 'Rejected').default('Pending'),
});

export default withdrawalRequestSchema;