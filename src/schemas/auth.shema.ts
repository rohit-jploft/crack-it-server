import * as Joi from "joi";

interface signUpDto {
  firstName: string;
  lastName: string;
  password: string;
  countryCode: string;
  email: string;
  role: string;
  phone: number;
  termAndConditions: boolean;
}
const signupSchema: Joi.ObjectSchema<signUpDto> = Joi.object<signUpDto>().keys({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid("SUPER_ADMIN", "USER", "ADMIN", "EXPERT"),
  countryCode: Joi.string(),
  phone: Joi.number(),
  termAndConditions: Joi.bool().valid(true),
});
interface loginDto {
  email: string;
  password: string;
  role: string;
}
const loginSchema: Joi.ObjectSchema<loginDto> = Joi.object<loginDto>().keys({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string(),
});
interface changePasswordDto {
  oldPassword: string;
  password: string;
}
const changePasswordSchema: Joi.ObjectSchema<changePasswordDto> =
  Joi.object<changePasswordDto>().keys({
    oldPassword: Joi.string().required(),
    password: Joi.string().required(),
  });

export { signupSchema, loginSchema ,changePasswordSchema};
