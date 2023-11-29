"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactJoiSchema = void 0;
const Joi = require('joi');
exports.contactJoiSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    message: Joi.string().required(),
    // Add validation rules for other fields here
});
