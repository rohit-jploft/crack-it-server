import { Types } from "mongoose";
import Expert from "../models/experts.model";

export const getAgencyOfAnyExpert = async (userId: Types.ObjectId) => {
  let isAssociatedWithAgency = false;
  try {
    const expert = await Expert.findOne({
      user: userId,
      agency: { $exists: true },
    });
    if (expert) {
      isAssociatedWithAgency = true;
      return { isAssociatedWithAgency, agencyId: expert.agency };
    } else {
      return { isAssociatedWithAgency, agencyId: null };
    }
  } catch (error: any) {
    return error.message;
  }
};

export const getAverageRatingOfSpecificCategory = async (
  categoryId: Types.ObjectId
) => {
  try {
    const allExpert = await Expert.find({ jobCategory: categoryId });
    let totalRating = 0;
    for (let exp of allExpert) {
      totalRating = totalRating + exp.rating;
    }
   
    let ratingValue = allExpert.length===0 ? 0 : totalRating / allExpert.length;
    return { rating: ratingValue, success: true };
  } catch (error: any) {
    return { success: true, message: error.message };
  }
};
