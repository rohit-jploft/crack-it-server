import Joi from 'joi';

const raiseTicketSchema = Joi.object({
  booking: Joi.string().required(),
  user: Joi.string().required(),
  reason: Joi.string().required(),
  query: Joi.string().required(),
});

export default raiseTicketSchema;
