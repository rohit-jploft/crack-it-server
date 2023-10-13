import Joi from 'joi';

const notificationSchema = Joi.object({
  sender: Joi.string().required(),
  receiver: Joi.string().required(),
  title: Joi.string().required(),
  message: Joi.string().required(),
  data: Joi.object().default({}),
  dynamicData: Joi.object().default({}),
});

export default notificationSchema;