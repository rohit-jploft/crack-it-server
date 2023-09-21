import Joi from 'joi';

// Define the CommissionData interface
interface CommissionData {
  title: string;
  type: 'PERCENT' | 'FIXED';
  percent?: number;
  amount?: number;
}

// Define the Joi schema for CommissionData
const commissionJoiSchema = Joi.object<CommissionData>({
  title: Joi.string().required(),
  type: Joi.string().valid('PERCENT', 'FIXED').required(),
  percent: Joi.number().when('type', {
    is: 'PERCENT',
    then: Joi.number().required(),
    otherwise: Joi.number(),
  }),
  amount: Joi.number().when('type', {
    is: 'FIXED',
    then: Joi.number().required(),
    otherwise: Joi.number(),
  }),
});

export { CommissionData, commissionJoiSchema };
