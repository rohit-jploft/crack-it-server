"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgencyRating = exports.getExpertRating = exports.rateExpert = void 0;
const RequestHelper_1 = require("../../helper/RequestHelper");
const expertRating_model_1 = __importDefault(require("../../models/expertRating.model"));
const rating_schema_1 = __importDefault(require("../../schemas/rating.schema"));
const agencyRating_model_1 = __importDefault(require("../../models/agencyRating.model"));
const Notification_controller_1 = require("../Notifications/Notification.controller");
const NotificationType_1 = require("../../utils/NotificationType");
const notificationMessageConstant_1 = require("../../utils/notificationMessageConstant");
const booking_model_1 = __importDefault(require("../../models/booking.model"));
const rateExpert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const { error, value } = rating_schema_1.default.validate(data);
    if (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
    try {
        const rate = yield expertRating_model_1.default.findOne({
            ratedBy: (0, RequestHelper_1.ObjectId)(value.ratedBy),
            expert: (0, RequestHelper_1.ObjectId)(value.expert),
            booking: (0, RequestHelper_1.ObjectId)(value.bookingId),
        });
        if (rate) {
            rate.rating = value.rating;
            rate.comment = value.comment ? value.comment : (rate === null || rate === void 0 ? void 0 : rate.comment) ? rate.comment : "";
            const updatedRating = yield rate.save();
            const updateratedOrNot = yield booking_model_1.default.findByIdAndUpdate((0, RequestHelper_1.ObjectId)(value.bookingId.toString()), { isExpertRated: true }, { new: true });
            console.log(updateratedOrNot);
            yield (0, Notification_controller_1.createNotification)(value.ratedBy, value.expert, notificationMessageConstant_1.NoticationMessage.ratingByUser.title, NotificationType_1.NotificationType.Rating, "web", notificationMessageConstant_1.NoticationMessage.ratingByUser.message);
            return res.status(200).json({
                success: true,
                status: 200,
                data: updatedRating,
                message: "Rating updated successfully",
            });
        }
        else {
            const rate = yield expertRating_model_1.default.create({
                expert: value.expert,
                ratedBy: value.ratedBy,
                booking: value.bookingId,
                rating: value.rating,
                comment: value.comment ? value.comment : ""
            });
            const updateratedOrNot = yield booking_model_1.default.findByIdAndUpdate((0, RequestHelper_1.ObjectId)(value.bookingId.toString()), { isExpertRated: true }, { new: true });
            return res.status(200).json({
                success: true,
                status: 200,
                data: rate,
                message: "Rating submitted successfully",
            });
        }
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.rateExpert = rateExpert;
const getExpertRating = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const ratings = yield expertRating_model_1.default.find({ expert: (0, RequestHelper_1.ObjectId)(userId) });
    let avgRating;
    let totalRating = 0;
    console.log(ratings, "rating data");
    if (ratings.length > 0) {
        for (let rating of ratings) {
            totalRating = totalRating + rating.rating;
        }
        avgRating = totalRating / ratings.length;
        return avgRating;
    }
    else {
        return 0;
    }
});
exports.getExpertRating = getExpertRating;
const getAgencyRating = (agencyId) => __awaiter(void 0, void 0, void 0, function* () {
    const ratings = yield agencyRating_model_1.default.find({ agency: (0, RequestHelper_1.ObjectId)(agencyId) });
    let avgRating;
    let totalRating = 0;
    if (ratings.length > 0) {
        for (let rating of ratings) {
            totalRating = totalRating + rating.rating;
        }
        avgRating = totalRating / ratings.length;
        return avgRating;
    }
    else {
        return 0;
    }
});
exports.getAgencyRating = getAgencyRating;
