import { Response, Request } from "express";

import { ObjectId, buildResult } from "../../helper/RequestHelper";
import { Types } from "mongoose";
import Expert, { ExpertsDocument } from "../../models/experts.model";
import expertSchema from "../../schemas/experts.schema";
import User from "../../models/user.model";
import { getExpertRating } from "../Rating/rating.controller";

// expert profile setup API
export const expertProfileSetup = async (req: Request, res: Response) => {
  try {
    const data: ExpertsDocument = req.body;

    // Check validation error using JOI
    const { value, error } = expertSchema.validate(data);
    console.log(data);
    // Return if any validation error
    if (error) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: error.message,
      });
    }
    console.log(value);
    // Save the company details
    const experts = await Expert.create(value);
    return res.status(200).json({
      status: 200,
      success: true,
      data: experts,
    });
  } catch (error: any) {
    // Return error if anything goes wrong
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};

// get experts profile by userId
export const getExpertProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const getExpertsData = await Expert.findOne({
      user: ObjectId(userId),
    })
      .populate("user", "firstName lastName email phone countryCode")
      .populate("expertise", "title");
    const rating = await getExpertRating(userId.toString());
    return res.status(200).json({
      status: 200,
      success: true,
      data: {
        user:getExpertsData,
        rating
      },
      message: "Experts profile detail",
    });
  } catch (error: any) {
    // Return error if anything goes wrong
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};
// query type for the below API
// type TitleRegex = {
//   $regex: string;
//   $options: string;
// };
// type queryData = {
//   parent?: Types.ObjectId | { $exists: boolean };
//   isDeleted: boolean;
//   title: TitleRegex;
// };

export const getAllExpertsProfile = async (req: Request, res: Response) => {
  const { search, categories } = req.query;
  var query = {};
  try {
    const profiles = await Expert.find();
    return res.status(200).json({
      status: 200,
      success: true,
      data: profiles,
      message: "Experts profiles fetched",
    });
  } catch (error: any) {
    // Return error if anything goes wrong
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};
