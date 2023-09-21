import * as Joi from "joi";

interface messageDto {
  chat: string; // You can use .objectId() if you have a custom Joi objectId validation
  sender: string; // You can use .objectId() if you have a custom Joi objectId validation
  content: string;
}
const messageJoiSchema: Joi.ObjectSchema<messageDto> = Joi.object<messageDto>({
  chat: Joi.string().required(), // You can use .objectId() if you have a custom Joi objectId validation
  sender: Joi.string().required(), // You can use .objectId() if you have a custom Joi objectId validation
  content: Joi.string().required(),
  // Define other fields here using Joi
});

export { messageJoiSchema };
