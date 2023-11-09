import * as Joi from "joi";

interface messageDto {
  chat: string; // You can use .objectId() if you have a custom Joi objectId validation
  sender: string; // You can use .objectId() if you have a custom Joi objectId validation
  content: string;
  type: string;
}
const messageJoiSchema: Joi.ObjectSchema<messageDto> = Joi.object<messageDto>({
  chat: Joi.string().required(), // You can use .objectId() if you have a custom Joi objectId validation
  type:Joi.string(),
  sender: Joi.string().required(), // You can use .objectId() if you have a custom Joi objectId validation
  content: Joi.string().when("type", { is: "text", then: Joi.required() }).allow(""),

  // Define other fields here using Joi
});

export { messageJoiSchema };
