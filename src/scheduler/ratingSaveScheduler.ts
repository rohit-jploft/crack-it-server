import { getExpertRating } from "../controllers/Rating/rating.controller";
import { ObjectId } from "../helper/RequestHelper";
import Expert from "../models/experts.model";

export const saveRating = async () => {
  try {
    const experts = await Expert.find({}, { user: 1 }).populate(
      "user",
      "firstName lastName email phone"
    );

    // Calculate and attach ratings to each expert
    const expertsWithRatings = await Promise.all(
      experts.map(async (expert: any) => {
        const rating = await getExpertRating(expert?.user._id);
        return {
          ...expert.toObject(),
          rating,
        };
      })
    );

    // Sort experts based on ratings in descending order
    const sortedExperts = expertsWithRatings.sort(
      (a: any, b: any) => b.rating - a.rating
    );
    for (let exp of sortedExperts) {
      const update = await Expert.findOneAndUpdate(
        { user: ObjectId(exp.user._id) },
        { rating: exp.rating },{new:true}
      );
    }
  } catch (error) {
    return error;
  }
};
