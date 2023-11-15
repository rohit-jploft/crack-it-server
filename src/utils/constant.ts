import * as dotenv from "dotenv";

dotenv.config();

export const MONGO_URI: any = process.env.MONGO_URI;
export const PORT: string | undefined = process.env.PORT;
export const NODE_ENV: string | undefined = process.env.NODE_ENV;
export const JWT_SECRET: any = process.env.JWT_SECRET;

export const timeZoneList = [
    { "offsetMinutes": -720, "symbol": "IDLW", "name": "International Date Line West" },
    { "offsetMinutes": -600, "symbol": "HST", "name": "Hawaii-Aleutian Standard Time" },
    { "offsetMinutes": -540, "symbol": "AKST", "name": "Alaska Standard Time" },
    { "offsetMinutes": -480, "symbol": "PST", "name": "Pacific Standard Time" },
    { "offsetMinutes": -420, "symbol": "MST", "name": "Mountain Standard Time" },
    { "offsetMinutes": -360, "symbol": "CST", "name": "Central Standard Time" },
    { "offsetMinutes": -300, "symbol": "EST", "name": "Eastern Standard Time" },
    { "offsetMinutes": -240, "symbol": "AST", "name": "Atlantic Standard Time" },
    { "offsetMinutes": -210, "symbol": "NST", "name": "Newfoundland Standard Time" },
    { "offsetMinutes": 0, "symbol": "UTC", "name": "Coordinated Universal Time" },
    { "offsetMinutes": 0, "symbol": "GMT", "name": "Greenwich Mean Time" },
    { "offsetMinutes": 60, "symbol": "CET", "name": "Central European Time" },
    { "offsetMinutes": 120, "symbol": "EET", "name": "Eastern European Time" },
    { "offsetMinutes": 180, "symbol": "MSK", "name": "Moscow Standard Time" },
    { "offsetMinutes": 330, "symbol": "IST", "name": "Indian Standard Time" },
    { "offsetMinutes": 480, "symbol": "CST", "name": "China Standard Time" },
    { "offsetMinutes": 540, "symbol": "JST", "name": "Japan Standard Time" },
    { "offsetMinutes": 600, "symbol": "AEST", "name": "Australian Eastern Standard Time" },
    { "offsetMinutes": 720, "symbol": "NZST", "name": "New Zealand Standard Time" }
  ]
