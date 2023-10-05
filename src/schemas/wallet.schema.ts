import Joi from "joi";

const withdrawalRequestSchema = Joi.object({
  user: Joi.string().required(), // Assuming user is represented by a string (e.g., user ID)
  bank: Joi.string().required(), // Assuming bank  is represented by a string (e.g., bank ID)
  amount: Joi.number().positive().required(),
  status: Joi.string()
    .valid("Pending", "Approved", "Rejected")
    .default("Pending"),
});

// Joi validation schema for BankData
export const bankValidationSchema = Joi.object({
  user: Joi.string().required(),
  type: Joi.string().valid("BANK", "UPI").required(),
  bankName: Joi.string().when("type", { is: "BANK", then: Joi.required() }),
  accountName: Joi.string().when("type", { is: "BANK", then: Joi.required() }),
  accountNo: Joi.number().when("type", { is: "BANK", then: Joi.required() }),
  ifscCode: Joi.string().when("type", { is: "BANK", then: Joi.required() }),
  upiId: Joi.string().when("type", { is: "UPI", then: Joi.required() }),
  isDeleted: Joi.boolean().default(false),
});

export default withdrawalRequestSchema;
