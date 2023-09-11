import { Response, Request } from "express";
import Category, {
  CategoryData,
  CategoryDocument,
} from "../../models/category.model";
import { CategorySchema } from "../../schemas/category.schema";
import { ObjectId, buildResult } from "../../helper/RequestHelper";
import { Types } from "mongoose";

// create category api
export const createCategory = async (req: Request, res: Response) => {
  try {
    const data: CategoryDocument = req.body;

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
    const category = await Category.create(value);
    return res.status(200).json({
      status: 200,
      success: true,
      data: category,
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
  var query = <queryData>{ isDeleted: false };
  if (parent) query.parent = ObjectId(parent.toString());
  if (!parent) query.parent = { $exists: false };
  if (search) query.title = { $regex: search.toString(), $options: "i" };
  try {
    const catorgies = await Category.find(query);

    return res.status(200).json({
      status: 200,
      success: true,
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
