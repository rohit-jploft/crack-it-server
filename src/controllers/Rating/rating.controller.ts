import { Response, Request } from "express";

import { ObjectId, buildResult } from "../../helper/RequestHelper";
import ExpertRating from "../../models/expertRating.model";
import expertRatingSchema from "../../schemas/rating.schema";
import AgencyRating from "../../models/agencyRating.model";

export const rateExpert = async (req: Request, res: Response) => {
  const data = req.body;

  const { error, value } = expertRatingSchema.validate(data);
  if (error) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }

  try {
    const rate = await ExpertRating.findOne({
      ratedBy: value.ratedBy,
      expert: value.expert,
    });
    if (rate) {
      rate.rating = value.rating;
      rate.comment = value.comment ? value.comment : rate.comment;
      const updatedRating = await rate.save();
      return res.status(200).json({
        success: true,
        status: 200,
        data: updatedRating,
        message: "Rating updated successfully",
      });
    } else {
      const rate = await ExpertRating.create(value);
      return res.status(200).json({
        success: true,
        status: 200,
        data: rate,
        message: "Rating submitted successfully",
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

export const getExpertRating = async (userId: string) => {
  const ratings = await ExpertRating.find({ expert: ObjectId(userId) });
  let avgRating;
  let totalRating = 0;
  if (ratings.length > 0) {
    for (let rating of ratings) {
      totalRating = totalRating + rating.rating;
    }
    avgRating = totalRating / ratings.length;
    return avgRating;
  } else {
    return 0;
  }
};
export const getAgencyRating = async (agencyId: string) => {
  const ratings = await AgencyRating.find({ agency: ObjectId(agencyId) });
  let avgRating;
  let totalRating = 0;
  if (ratings.length > 0) {
    for (let rating of ratings) {
      totalRating = totalRating + rating.rating;
    }
    avgRating = totalRating / ratings.length;
    return avgRating;
  } else {
    return 0;
  }
};
