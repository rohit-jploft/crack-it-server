"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TimeZoneSchema = new mongoose_1.Schema({
    name: {
        type: String,
        require: true,
        index: true,
    },
    symbol: String,
    offsetMinutes: Number,
    // isDeleted: {
    //   type: Boolean,
    //   default: false,
    // },
}, { timestamps: true });
const TimeZone = (0, mongoose_1.model)("TimeZone", TimeZoneSchema);
exports.default = TimeZone;
