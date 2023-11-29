"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bookingSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    expert: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    jobDescription: {
        type: String,
    },
    isExpertRated: {
        type: Boolean,
        default: false
    },
    jobCategory: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
    },
    startTime: {
        type: Date,
        // default: null,
        // // get: (v: any) => v?.toLocaleTimeString([], { hour12: false }),
        // set: (v: any) => {
        //   const current = new Date();
        //   let date: any = current.getDate();
        //   let month: any = current.getMonth() + 1;
        //   if (date < 10) {
        //     date = "0" + date.toString();
        //   }
        //   if (month < 10) {
        //     month = "0" + month.toString();
        //   }
        //   console.log(
        //     "startTime",
        //     `${current.getFullYear()}-${month}-${date}T${v}.000Z`
        //   );
        //   return new Date(`${current.getFullYear()}-${month}-${date}T${v}.000Z`);
        // },
    },
    endTime: {
        type: Date,
        // default: null,
        // get: (v: any) => v?.toLocaleTimeString([], { hour12: false }),
        // set: (v: any) => {
        //   const current = new Date();
        //   let date: any = current.getDate() ;
        //   let month: any = current.getMonth() + 1;
        //   if (date < 10) {
        //     date = "0" + date.toString();
        //   }
        //   if (month < 10) {
        //     month = "0" + month.toString();
        //   }
        //   console.log(
        //     "startTime",
        //     `${current.getFullYear()}-${month}-${date}T${v}.000Z`
        //   );
        //   return new Date(`${current.getFullYear()}-${month}-${date}T${v}.000Z`);
        // },
    },
    status: {
        type: String,
        enum: [
            "REQUESTED",
            "ACCEPTED",
            "CONFIRMED",
            "DECLINED",
            "COMPLETED",
            "CANCELLED",
        ],
        default: "REQUESTED",
    },
    date: {
        type: Date,
    },
    timeZone: String,
    skills: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "Category",
        require: true,
    },
    duration: {
        type: Number,
    },
}, { timestamps: true });
const Booking = (0, mongoose_1.model)("Booking", bookingSchema);
bookingSchema.set("toJSON", {
    transform: (doc, ret, opt) => {
        delete ret.__v;
        return ret;
    },
});
exports.default = Booking;
