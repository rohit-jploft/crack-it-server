import { Request, Response } from "express";
import TimeZone from "../models/timeZone.model";

export const getAllTimeZones = async (req:Request, res:Response) => {
    try {
        const TimesZones = await TimeZone.find();
        await TimeZone.create({name:"2", offsetMinutes:200, symbol:"UTC"})
        return res.status(200).json({
            success:true,
            status:200,
            data:TimesZones,
            message:"all timeZones fetched successfully"
        })
    } catch (error:any) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
          });
    }
}