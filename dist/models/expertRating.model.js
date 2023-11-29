"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ExpertRatingSchema = new mongoose_1.Schema({
    rating: {
        type: Number,
        require: true,
    },
    booking: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Booking",
    },
    expert: {
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
const ExpertRating = (0, mongoose_1.model)("ExpertRating", ExpertRatingSchema);
exports.default = ExpertRating;
