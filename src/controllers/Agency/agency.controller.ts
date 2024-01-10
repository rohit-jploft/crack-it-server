import { Request, Response } from "express";
import {
  AgencyExpertiseSchemaSchema,
  expertSchema,
} from "../../schemas/experts.schema";
import Agency, { AgencyDocument } from "../../models/agency.model";
import User from "../../models/user.model";
import Expert, { ExpertsDocument } from "../../models/experts.model";
import { ObjectId } from "../../helper/RequestHelper";
import { getAgencyRating } from "../Rating/rating.controller";
import { agencyExpertSchema } from "../../schemas/agency.schema";
import { createWallet } from "../Wallet/wallet.controller";
import * as bcrypt from "bcrypt";
import {
  INCORRECT_PASSWORD,
  USER_ALREADY_EXISTS,
  USER_NOT_FOUND_ERR,
} from "../../utils/error";
import { Roles } from "../../utils/role";
export const AgencyProfileSetup = async (req: Request, res: Response) => {
  try {
    const data: AgencyDocument = req.body;

    // Check validation error using JOI
    const { value, error } = AgencyExpertiseSchemaSchema.validate(data);
    console.log(value, "values");
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
    const exp: any = await Agency.findOne({
      agency: ObjectId(expertId.toString()),
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
    exp.languages = data.language ? data.language : exp.language;
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
      .populate("user", "firstName lastName email phone role profilePhoto")
      .populate("jobCategory", "title")
      .populate("agency", "agencyName")
      .populate("expertise", "title");
    console.log(experts);
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
export const getAgencyProfile = async (req: Request, res: Response) => {
  const { agencyId } = req.params;
  try {
    const getExpertsData = await Agency.findOne({
      agency: ObjectId(agencyId),
    })
      .populate(
        "agency",
        "agencyName email phone countryCode isExpertProfileVerified profilePhoto"
      )
      .populate("expertise", "title")
      .populate("jobCategory", "title");
    const rating = await getAgencyRating(agencyId.toString());
    return res.status(200).json({
      status: 200,
      success: true,
      data: {
        expert: getExpertsData,
        rating,
      },
      message: "agency profile detail",
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

export const addNewAgencyExpert = async (req: Request, res: Response) => {
  const data = req.body;

  // Check validation error using JOI
  const { value, error } = agencyExpertSchema.validate(data);
  console.log(data);
  console.log(req?.files);


  if (req.files) {
    var { profilePic }: any = req?.files;
    if (!profilePic) {
      return res.status(200).json({
        success: false,
        status: 206,
        message: "Profile pic is required",
      });
    }
    var media = profilePic[0]?.path?.replaceAll("\\", "/") || "";
  }
  // Return if any validation error
  if (error) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }

  try {
    // check user exists or not
    const IsUserExist = await User.findOne({
      $or: [{ email: value.email.toLowerCase() }, { phone: value.phone }],
    });

    // if user exists
    if (IsUserExist) {
      return res.status(200).json({
        status: 200,
        success: false,
        type: "error",
        message: USER_ALREADY_EXISTS,
      });
    } else {
      // if user does not exist in our database
      // then create a new user in db
      const hashedPassword = await bcrypt.hash(value.password, 12);

      const newUser = await User.create({
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email.toLowerCase(),
        phone: value.phone,
        role: Roles.EXPERT,
        agency:value.agency,
        profilePhoto: value.profilePhoto,
        password: hashedPassword,
        countryCode: value.countryCode,
        termAndConditions: true,
        isExpertProfileVerified: true,
      });
      // save
      await createWallet(newUser._id.toString());

      const newExpert = await Expert.create({
        user: newUser._id,
        description: value.description,
        agency: value.agency,
        price: value.price,
        languages: value.languages,
        experience: value.experience,
        jobCategory: value.jobCategory,
        expertise: value.expertise,
      });
      return res.status(200).json({
        status: 200,
        success: true,
        data: newExpert,
        message: "New Agency expert created successfully",
      });
    }
  } catch (error: any) {
    // Return error if anything goes wrong
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
};
