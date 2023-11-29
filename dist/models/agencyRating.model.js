"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AgencyRatingSchema = new mongoose_1.Schema({
    rating: {
        type: Number,
        require: true,
    },
    agency: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    ratedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    comment: {
        type: String,
        default: "",
    },
}, { timestamps: true });
const AgencyRating = (0, mongoose_1.model)("AgencyRating", AgencyRatingSchema);
exports.default = AgencyRating;
