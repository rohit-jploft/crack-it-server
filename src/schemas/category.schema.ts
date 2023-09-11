import * as Joi from "joi";


interface categoryDto {
  title: string;
  parent: string;
}
const CategorySchema: Joi.ObjectSchema<categoryDto> = Joi.object<categoryDto>().keys({
  title: Joi.string().required(),
  parent: Joi.string(),
});

export { CategorySchema };
