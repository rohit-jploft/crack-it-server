import { Response, Request } from "express";
import Category, {
  CategoryData,
  CategoryDocument,
} from "../../models/category.model";
import { CategorySchema } from "../../schemas/category.schema";
import { ObjectId, buildResult } from "../../helper/RequestHelper";
import { Types } from "mongoose";
import { pagination } from "../../helper/pagination";
import Expert from "../../models/experts.model";
import { getAverageRatingOfSpecificCategory } from "../../helper/bookingHelper";

// create category api
export const createCategory = async (req: Request, res: Response) => {
  try {
    const data: CategoryDocument = req.body;
    console.log(data);
    if (req?.files) {
      var { image }: any = req?.files;
      var image = image[0]?.path?.replaceAll("\\", "/") || "";
    }

    // Check validation error using JOI
    const { value, error } = CategorySchema.validate(data);

    // Return if any validation error
    if (error) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: error.message,
      });
    }

    // Save the company details
    const category = await Category.create({ ...value, image: image });
    return res.status(200).json({
      status: 200,
      success: true,
      data: category,
      message: "Category created Successfully",
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
type TitleRegex = {
  $regex: string;
  $options: string;
};
type queryData = {
  parent?: Types.ObjectId | { $exists: boolean };
  isDeleted: boolean;
  title: TitleRegex;
};

// get all category API
export const getAllcategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let { parent, search } = req.query;
  // pagination query data
  const currentPage = Number(req?.query?.page) + 1 || 1;

  let limit = Number(req?.query?.limit) || 10;

  const skip = limit * (currentPage - 1);

  // filter query data
  var query = <queryData>{ isDeleted: false };
  if (parent) query.parent = ObjectId(parent.toString());
  if (!parent) query.parent = { $exists: false };
  if (search) query.title = { $regex: search.toString(), $options: "i" };

  try {
    const catorgies = await Category.find(query)
      .populate("parent")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // TOTAL COUNT
    const totalCount = await Category.countDocuments(query);

    return res.status(200).json({
      status: 200,
      success: true,
      pagination: pagination(totalCount, currentPage, limit),
      data: catorgies,
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
// update the category
export const updateCategory = async (req: Request, res: Response) => {
  const data = req.body;
  let { categoryId } = req.params;
  // Check validation error using JOI
  const { value, error } = CategorySchema.validate(data);

  if (req?.files) {
    var { image }: any = req?.files;
    var image = image[0]?.path?.replaceAll("\\", "/") || "";
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
    var payload = <any>{};
    if (data.title) payload.title = value.title;
    if (data.parent) payload.parent = value.parent;
    if (image) payload.image = image;
    // Save the company details
    const category = await Category.findByIdAndUpdate(
      categoryId,
      {
        ...payload,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      status: 200,
      data: category,
      message: "Category Updated Successfully",
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

// delete category
export const deleteCategory = async (req: Request, res: Response) => {
  let { categoryId } = req.params;

  try {
    // Save the company details
    const category = await Category.findByIdAndUpdate(
      categoryId,
      {
        isDeleted: true,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      status: 200,
      message: "Category Deleted Successfully",
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

export const getAllCategoryWithNoOfExpert = async (
  req: Request,
  res: Response
) => {
  try {
    const categories = await Category.find(
      { parent: { $exists: false }, isDeleted: false },
      { title: 1 }
    );
    let finalRes = [];
    for (let cat of categories) {
      const noOfExp = await Expert.countDocuments({ jobCategory: cat?._id });
      
      // below function will give you the avg rtating of all expert of a specific category
      let ratingObj = await getAverageRatingOfSpecificCategory(cat._id);
      if(cat._id.toString()=='658c21b5fe7227cd17311854'){
        console.log(ratingObj, "ratingObj")
      }
      if (ratingObj.success) {
        finalRes.push({
          category: cat,
          noOfExpert: noOfExp,
          averageRating: ratingObj.rating,
        });
      } else {
        return res.status(200).json({
          success: false,
          status: 200,
          message: ratingObj.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      status: 200,
      data: finalRes,
      message: "data fetched successfully",
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
