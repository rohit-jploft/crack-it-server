import { Request, Response } from "express";
import {timeZoneList} from "../utils/constant"
import TimeZone from "../models/timeZone.model";

export function removeDoubleSlashes(inputString: string): string {
  return inputString.replace(/\\/g, "/");
}

export function getLoggedInUserId(req: Request, res: Response): string {
  return res.locals.user._id;
}
export function generateRandomNumber(): number {
  const min = 10000000; // Minimum 8-digit number (10000000)
  const max = 99999999; // Maximum 8-digit number (99999999)
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function generateOtp(): number {
  const min = 100000; // Minimum 8-digit number (10000000)
  const max = 999999; // Maximum 8-digit number (99999999)
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// this function is used for storing time in mongodb ;
export function getTimeInDateStamp(time: string): string {
  // time formatnew is HH:MM:SS in string type
  const today = new Date();
  let month: any = today.getMonth();
  if (month < 10) {
    month = "0" + month.toString();
  }
  return `${today.getFullYear()}-${month}-${today.getDate()}T${time}Z`
}
export function getDateInDateStamp(date: string): Date {
  // date -- YYYY-MM-DD in string type
  console.log(date, "date")
  return new Date(date);
}

export function addMinutesToDate(date: Date, minutesToAdd: number): Date {
  return new Date(date.getTime() + minutesToAdd * 60000);
}
export function addMinutesToTime(timeString:string, minutesToAdd:number) {
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
  } else {
    return ""; // Invalid time format
  }
}
export async function getHoursBefore(startTime:Date) {
  const currentTime = new Date();
  let bookStartTime = new Date(startTime)
  const timeDifference = bookStartTime.getTime() - currentTime.getTime();
  const hoursBefore = timeDifference / (1000 * 60 * 60); // Milliseconds to hours
  return hoursBefore;
}


export function combineTimestamps(dateTimestamp:Date, timeTimestamp:Date) {
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



/// time zone symbol and get the timeZone format
export function getTheTimeZoneConvertedTime(dateTimeStamp:Date, timeZoneSymbol:string, isUtcToOther:boolean){
     const getOffSetTime:any = timeZoneList.find(t => t.symbol === timeZoneSymbol);
     if(isUtcToOther){
      const convertTime = addMinutesToDate(dateTimeStamp, getOffSetTime?.offsetMinutes);
     return convertTime;
     } else {
      const convertTime = addMinutesToDate(dateTimeStamp, -getOffSetTime?.offsetMinutes);
      return convertTime;
     }
}

export function getTheFinalStartTimeConvertedInDesiredTimeZone(date:Date, time:string, timeZone:string, ){
  //date ------ ("year-month-date") e.g 2023-10-10
  // time ------------ ("hours:mins:sec") e.g 11:32:00
  const [hours, mins, secs] = time.split(':').map(Number);
  // const [year, month, dateNum] = date.split('-').map(Number);
  const year = date.getFullYear();
  const month = date.getMonth();
  const dateNum = date.getDate();

  const combinedTimeAndDate = new Date(year, month, dateNum, hours, mins,secs, 0);

  const convertedTime = getTheTimeZoneConvertedTime(combinedTimeAndDate, timeZone, false);

  return convertedTime;

}

export const getConvertedTimeintoUTC = (timeStamp:string, timeZone:string) => {
    const getOffSetTime:any = timeZoneList.find(({symbol}) => symbol == timeZone);
    console.log(getOffSetTime, "getOffSetTime")
    const converted = new Date(timeStamp);
    console.log(converted, "before conversion")
    converted.setMinutes((converted.getMinutes())-(getOffSetTime.offsetMinutes));
    console.log(converted, "after conversion")
    return converted;
}
