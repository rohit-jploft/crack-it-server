import { Response, Request } from "express";

import { ObjectId, buildResult } from "../../helper/RequestHelper";
import { Types } from "mongoose";
import Expert, { ExpertsDocument } from "../../models/experts.model";
// import expertSchema from "../../schemas/experts.schema";
import User from "../../models/user.model";
import {
  getExpertRating,
  getNoOfRatingOfExpert,
} from "../Rating/rating.controller";
import { expertSchema } from "../../schemas/experts.schema";
import { pagination } from "../../helper/pagination";

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

    // check role is expert or not
    const userData = await User.findById(value.user);
    if (userData) {
      userData.isExpertProfileVerified = true;
      await userData.save();
    }
    // Save the company details
    const experts = await Expert.findOne({ user: data.user });
    if (experts) {
      return res.status(200).json({
        success: false,
        status: 200,
        message: "Profile is already set",
      });
    } else {
      var expData = await Expert.create({ ...value });
    }

    return res.status(200).json({
      status: 200,
      success: true,
      data: expData,
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
      .populate(
        "user",
        "firstName lastName email phone countryCode isExpertProfileVerified profilePhoto"
      )
      .populate("expertise", "title")
      .populate("agency", "-password")
      .populate("jobCategory", "title");
    const rating: any = await getExpertRating(userId.toString());
    const noOfRating = await getNoOfRatingOfExpert(userId.toString());
    return res.status(200).json({
      status: 200,
      success: true,
      data: {
        expert: getExpertsData,
        rating,
        noOfRatingsGiven: noOfRating,
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

// export const getAllExpertsProfile = async (req: Request, res: Response) => {
//   const { search, categories } = req.query;
//   var query = {};
//   try {
//     const profiles = await Expert.find();
//     return res.status(200).json({
//       status: 200,
//       success: true,
//       data: profiles,
//       message: "Experts profiles fetched",
//     });
//   } catch (error: any) {
//     // Return error if anything goes wrong
//     return res.status(403).json({
//       success: false,
//       status: 403,
//       message: error.message,
//     });
//   }
// };

export const getAllExpertBasedOnSearch = async (
  req: Request,
  res: Response
) => {
  try {
    let {
      jobCategory,
      skills,
      search,
      startPrice,
      endPrice,
      minExperience,
      maxExperience,
      rating,
      typeOfExpert,
    } = req.query;
    // console.log(jobCategory);
    if (skills) {
      var expertise: any = skills
        ?.toString()
        .split(",")
        .map((item: string) => ObjectId(item.trim()));
    }
    const pipeline = [];
    var typeLength;
    if (typeOfExpert) {
      typeOfExpert = typeOfExpert.toString().split(",");
      typeLength = typeOfExpert.length;
    }

    if (jobCategory) {
      pipeline.push({
        $match: {
          jobCategory: ObjectId(jobCategory.toString()),
        },
      });
    }
    if (typeOfExpert && typeLength === 1) {
      if (typeOfExpert[0] === "AGENCY") {
        pipeline.push({
          $match: {
            agency: { $exists: true },
          },
        });
      }
      if (typeOfExpert[0] === "EXPERT") {
        pipeline.push({
          $match: {
            agency: { $exists: false },
          },
        });
      }
    }

    if (skills && expertise?.length > 0) {
      pipeline.push({
        $match: {
          expertise: { $in: expertise },
        },
      });
    }
    if (startPrice && endPrice) {
      pipeline.push({
        $match: {
          price: {
            $gte: parseInt(startPrice.toString()),
            $lte: parseInt(endPrice.toString()),
          },
        },
      });
    }
    if (minExperience && maxExperience) {
      pipeline.push({
        $match: {
          experience: {
            $gte: parseInt(minExperience.toString()),
            $lte: parseInt(maxExperience.toString()),
          },
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: "users", // Assuming the collection name is 'users'
        localField: "agency",
        foreignField: "_id",
        as: "agency",
        pipeline: [
          {
            $project: {
              agencyName: 1,
              profilePhoto: 1,
              role: 1,
              email: 1,
            },
          },
        ],
      },
    });
    pipeline.push({
      $unwind: {
        path: "$agency",
        preserveNullAndEmptyArrays: true,
      },
    });
    pipeline.push({
      $lookup: {
        from: "users", // Assuming the collection name is 'users'
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              phone: 1,
              countryCode: 1,
              profilePhoto: 1,
              agency: 1,
              email: 1,
            },
          },
        ],
      },
    });
    pipeline.push({
      $unwind: {
        path: "$user",
      },
    });
    pipeline.push({
      $lookup: {
        from: "categories", // Assuming the collection name is 'users'
        localField: "jobCategory",
        foreignField: "_id",
        as: "jobCategory",
      },
    });
    pipeline.push({
      $unwind: {
        path: "$jobCategory",
      },
    });
    pipeline.push({
      $lookup: {
        from: "categories", // Assuming the collection name is 'users'
        localField: "expertise",
        foreignField: "_id",
        as: "expertise",
      },
    });
    // pipeline.push({
    //   $unwind: {
    //     path: "$expertiseData",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // });
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "user.firstName": { $regex: search, $options: "i" } },
            { "user.lastName": { $regex: search, $options: "i" } },
          ],
        },
      });
    }
    const experts = await Expert.aggregate(pipeline);
    const list: any = await Promise.all(
      experts.map(async (expert) => {
        const rating = await getExpertRating(expert.user._id.toString());
        return {
          ...expert,
          rating: rating,
        };
      })
    );
    let finalList;
    if (rating) {
      finalList = await Promise.all(
        list.filter((exprt: any) => {
          return parseInt(exprt.rating.toString()) >= parseInt(`${rating}`);
        })
      );
    }
    console.log(list, "list");
    console.log(finalList, "final list");
    return res.status(200).json({
      success: true,
      status: 200,
      data: rating ? finalList : list,
      message: "Experts are listed according to your interest",
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

export const updateExpert = async (req: Request, res: Response) => {
  const data = req.body;
  const { userId } = req.params;
  console.log(data, "update data");
  try {
    const exp: any = await Expert.findOne({
      user: ObjectId(userId.toString()),
    });
    const user: any = await User.findOne({
      _id: ObjectId(userId.toString()),
    });

    if (!exp) {
      return res.status(200).json({
        success: false,
        status: 200,
        message: "Expert not found",
      });
    }
    user.firstName = data.firstName ? data.firstName : user.firstName;
    user.lastName = data.lastName ? data.lastName : user.lastName;
    exp.description = data.description ? data.description : exp.description;
    exp.price = data.price ? data.price : exp.price;
    exp.languages = data.language ? data.language : exp.languages;
    exp.expertise = data.expertise ? data.expertise : exp.expertise;
    exp.jobCategory = data.jobCategory ? data.jobCategory : exp.jobCategory;
    exp.experience = data?.experience ? data?.experience : exp.experience;

    await exp.save();
    await user.save();

    return res.status(200).json({
      status: 200,
      success: true,
      data: exp,
      message: "Expert profile updated successfully",
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

export const getAllHighestRatedExpert = async (req: Request, res: Response) => {
  const currentPage = Number(req?.query?.page) + 1 || 1;
  const limit = Number(req?.query?.limit) || 10;
  const skip = limit * (currentPage - 1);
  const { jobCategory, search } = req.query;
  let query: any = {};
  if (jobCategory) {
    query.jobCategory = ObjectId(jobCategory.toString());
  }

  console.log(query, "query");
  try {
    // Find all experts and sort them by rating
    const sortedExperts = await Expert.find(query)
      .populate("user", "firstName lastName email phone profilePhoto")
      .populate("jobCategory", "title")
      .populate("expertise", "title")
      .sort({ rating: -1 }) // Sorting by rating in descending order
      .skip(skip)
      .limit(limit);

    const totalCount = await Expert.countDocuments(query);

    return res.status(200).json({
      success: true,
      status: 200,
      data: sortedExperts,
      pagination: pagination(totalCount, currentPage, limit),
      message: "Experts are listed according to their rating",
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
