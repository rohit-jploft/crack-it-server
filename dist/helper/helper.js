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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTheFinalStartTimeConvertedInDesiredTimeZone = exports.getTheTimeZoneConvertedTime = exports.combineTimestamps = exports.getHoursBefore = exports.addMinutesToTime = exports.addMinutesToDate = exports.getDateInDateStamp = exports.getTimeInDateStamp = exports.generateRandomNumber = exports.getLoggedInUserId = exports.removeDoubleSlashes = void 0;
const constant_1 = require("../utils/constant");
function removeDoubleSlashes(inputString) {
    return inputString.replace(/\\/g, "/");
}
exports.removeDoubleSlashes = removeDoubleSlashes;
function getLoggedInUserId(req, res) {
    return res.locals.user._id;
}
exports.getLoggedInUserId = getLoggedInUserId;
function generateRandomNumber() {
    const min = 10000000; // Minimum 8-digit number (10000000)
    const max = 99999999; // Maximum 8-digit number (99999999)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.generateRandomNumber = generateRandomNumber;
// this function is used for storing time in mongodb ;
function getTimeInDateStamp(time) {
    // time formatnew is HH:MM:SS in string type
    const today = new Date();
    let month = today.getMonth();
    if (month < 10) {
        month = "0" + month.toString();
    }
    console.log(`${today.getFullYear()}-${month}-${today.getDate()}T${time}Z`);
    return `${today.getFullYear()}-${month}-${today.getDate()}T${time}Z`;
}
exports.getTimeInDateStamp = getTimeInDateStamp;
function getDateInDateStamp(date) {
    // date -- YYYY-MM-DD in string type
    console.log(date, "date");
    return new Date(date);
}
exports.getDateInDateStamp = getDateInDateStamp;
function addMinutesToDate(date, minutesToAdd) {
    return new Date(date.getTime() + minutesToAdd * 60000);
}
exports.addMinutesToDate = addMinutesToDate;
function addMinutesToTime(timeString, minutesToAdd) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
        const totalMinutes = hours * 60 + minutes + minutesToAdd;
        const newHours = Math.floor(totalMinutes / 60) % 24;
        const newMinutes = totalMinutes % 60;
        // Format the new time components with leading zeros
        const formattedHours = String(newHours).padStart(2, '0');
        const formattedMinutes = String(newMinutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }
    else {
        return ""; // Invalid time format
    }
}
exports.addMinutesToTime = addMinutesToTime;
function getHoursBefore(startTime) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(startTime, "starttime");
        const currentTime = new Date();
        let bookStartTime = new Date(startTime);
        const timeDifference = bookStartTime.getTime() - currentTime.getTime();
        const hoursBefore = timeDifference / (1000 * 60 * 60); // Milliseconds to hours
        console.log(hoursBefore, "hello");
        return hoursBefore;
    });
}
exports.getHoursBefore = getHoursBefore;
function combineTimestamps(dateTimestamp, timeTimestamp) {
    // Create Date objects from the provided timestamps
    const dateObj = new Date(dateTimestamp.toString());
    const timeObj = new Date(timeTimestamp.toString());
    // Extract date components
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const day = dateObj.getDate();
    // Extract time components
    const hours = timeObj.getHours();
    const minutes = timeObj.getMinutes();
    const seconds = timeObj.getSeconds();
    const milliseconds = timeObj.getMilliseconds();
    // Create a new Date object with the combined date and time components
    const combinedTimestamp = new Date(year, month, day, hours, minutes, seconds, milliseconds);
    return combinedTimestamp;
}
exports.combineTimestamps = combineTimestamps;
/// time zone symbol and get the timeZone format
function getTheTimeZoneConvertedTime(dateTimeStamp, timeZoneSymbol, isUtcToOther) {
    const getOffSetTime = constant_1.timeZoneList.find(t => t.symbol === timeZoneSymbol);
    console.log(getOffSetTime);
    if (isUtcToOther) {
        const convertTime = addMinutesToDate(dateTimeStamp, getOffSetTime === null || getOffSetTime === void 0 ? void 0 : getOffSetTime.offsetMinutes);
        return convertTime;
    }
    else {
        const convertTime = addMinutesToDate(dateTimeStamp, -(getOffSetTime === null || getOffSetTime === void 0 ? void 0 : getOffSetTime.offsetMinutes));
        return convertTime;
    }
}
exports.getTheTimeZoneConvertedTime = getTheTimeZoneConvertedTime;
function getTheFinalStartTimeConvertedInDesiredTimeZone(date, time, timeZone) {
    //date ------ ("year-month-date") e.g 2023-10-10
    // time ------------ ("hours:mins:sec") e.g 11:32:00
    const [hours, mins, secs] = time.split(':').map(Number);
    // const [year, month, dateNum] = date.split('-').map(Number);
    const year = date.getFullYear();
    const month = date.getMonth();
    const dateNum = date.getDate();
    console.log("year - ", year);
    console.log("month - ", month);
    console.log("dateNum - ", dateNum);
    const combinedTimeAndDate = new Date(year, month, dateNum, hours, mins, secs, 0);
    const convertedTime = getTheTimeZoneConvertedTime(combinedTimeAndDate, timeZone, false);
    return convertedTime;
}
exports.getTheFinalStartTimeConvertedInDesiredTimeZone = getTheFinalStartTimeConvertedInDesiredTimeZone;
