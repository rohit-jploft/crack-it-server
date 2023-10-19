import { Request, Response } from "express";
import {
  AgencyExpertiseSchemaSchema,
  expertSchema,
} from "../../schemas/experts.schema";
import Agency, { AgencyDocument } from "../../models/agency.model";
import User from "../../models/user.model";
import Expert, { ExpertsDocument } from "../../models/experts.model";
import { ObjectId } from "../../helper/RequestHelper";

export const AgencyProfileSetup = async (req: Request, res: Response) => {
  try {
    const data: AgencyDocument = req.body;

    // Check validation error using JOI
    const { value, error } = AgencyExpertiseSchemaSchema.validate(data);
    // Return if any validation error
    if (error) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: error.message,
      });
    }

    // check role is expert or not
    const userData = await User.findById(value.agency);
    if (userData) {
      userData.isExpertProfileVerified = true;
      await userData.save();
    }
    // Save the company details
    const experts = await Agency.findOne({ agency: data.agency });
    if (experts) {
      return res.status(200).json({
        success: false,
        status: 200,
        message: "Agency Profile is already set",
      });
    } else {
      var AgencyexpData = await Agency.create({ ...value });
    }

    return res.status(200).json({
      status: 200,
      success: true,
      data: AgencyexpData,
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

export const updateAgencyExpert = async (req: Request, res: Response) => {
  const data = req.body;
  const { expertId } = req.params;
  try {
    const exp: any = await Expert.findOne({
      _id: ObjectId(expertId.toString()),
    });

    if (!exp) {
      return res.status(200).json({
        success: false,
        status: 200,
        message: "Expert not found",
      });
    }
    exp.description = data.description ? data.description : exp.description;
    exp.price = data.price ? data.price : exp.price;
    exp.language = data.language ? data.language : exp.language;
    exp.expertise = data.expertise ? data.expertise : exp.expertise;
    exp.jobCategory = data.jobCategory ? data.jobCategory : exp.jobCategory;
    exp.experience = data?.experience ? data?.experience : exp.experience;

    await exp.save();

    return res.status(200).json({
      status: 200,
      success: true,
      data: exp,
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
// list of agency experts
export const getAllAgencyExperts = async (req: Request, res: Response) => {
  const { agencyId } = req.params;
  try {
    const experts = await Expert.find({ agency: ObjectId(agencyId) })
      .populate("user", "firstName lastName email phone")
      .populate("jobCategory", "title")
      .populate("agency", "agencyName")
      .populate("expertise", "title");

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

export const deleteAgencyExpert = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await User.deleteOne({ _id: ObjectId(userId) });
    const expert = await Expert.deleteOne({ user: ObjectId(userId) });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Agency experts deleted successfully",
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
