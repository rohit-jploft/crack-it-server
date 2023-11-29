"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const contactSchema = new mongoose_1.Schema({
    name: String,
    email: String,
    phone: String,
    message: String,
    // Define other fields here
}, { timestamps: true });
const Contact = (0, mongoose_1.model)("Contacts", contactSchema);
exports.default = Contact;
