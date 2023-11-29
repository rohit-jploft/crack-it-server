"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require('joi').extend(require('@joi/date'));
// Define the Joi schema for the Booking model
const bookingSchema = Joi.object({
    user: Joi.string().required(),
    jobCategory: Joi.string().required(),
    jobDescription: Joi.string(),
    date: Joi.date().format('YYYY-MM-DD').required(),
    duration: Joi.number().required(),
    expert: Joi.string().required(),
    // time --------- HH:MM:SS
    startTime: Joi.string().required(),
    timeZone: Joi.string(),
    skills: Joi.array().items(Joi.string().required()),
});
exports.default = bookingSchema;
