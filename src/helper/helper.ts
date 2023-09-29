import { Request, Response } from "express";

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

// this function is used for storing time in mongodb ;
export function getTimeInDateStamp(time: string): Date {
  // time formatnew is HH:MM:SS in string type
  const today = new Date();
  let month: any = today.getMonth();
  if (month < 10) {
    month = "0" + month.toString();
  }
  console.log(`${today.getFullYear()}-${month}-${today.getDate()}T${time}Z`);
  return new Date(
    `${today.getFullYear()}-${month}-${today.getDate()}T${time}Z`
  );
}
export function getDateInDateStamp(date: string): Date {
  // date -- YYYY-MM-DD in string type
  console.log(date, "date")
  return new Date(date);
}

export function addMinutesToDate(date: Date, minutesToAdd: number): Date {
  return new Date(date.getTime() + minutesToAdd * 60000);
}
