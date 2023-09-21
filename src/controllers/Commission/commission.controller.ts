import { Response, Request } from "express";

import { ObjectId, buildResult } from "../../helper/RequestHelper";
import { Types } from "mongoose";
import { CommissionData, commissionJoiSchema } from "../../schemas/commission.schema";
import Commission from "../../models/commission.model";

// create commission api
export const createCommission = async (req: Request, res: Response) => {
  try {
    const data: CommissionData = req.body;

    // Check validation error using JOI
    const { value, error } = commissionJoiSchema.validate(data);

    // Return if any validation error
    if (error) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: error.message,
      });
    }

    // Save the commission details
    const commission = await Commission.create(value);
    return res.status(200).json({
      status: 200,
      success: true,
      data: commission,
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
  type: TitleRegex;
};

// get all commission API
export const getAllCommission = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let { type } = req.query;
  var query = <queryData>{ isDeleted: false };
 
  if (type) query.type = { $regex: type.toString(), $options: "i" };
  try {
    const commission = await Commission.find(query);

    return res.status(200).json({
      status: 200,
      success: true,
      data: commission,
      message:"commission fetched successfully"
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
// update the commission
export const updateCommission = async (req: Request, res: Response) => {
  const data = req.body;
  let { commissionId } = req.params;
  // Check validation error using JOI
//   const { value, error } = commissionJoiSchema.validate(data);

  // Return if any validation error
//   if (error) {
//     return res.status(403).json({
//       success: false,
//       status: 403,
//       message: error.message,
//     });
//   }

  try {
    var payload = <any>{};
    if (data.title) payload.title = data.title;
    if (data.type) payload.type = data.type;
    if (data.percent) payload.percent = data.percent;
    if (data.amount) payload.amount = data.amount;
    // Save the commission details
    const commission = await Commission.findByIdAndUpdate(
        commissionId,
      {
        ...payload,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      status: 200,
      data: commission,
      message: "commission Updated Successfully",
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
export const deleteCommission = async (req: Request, res: Response) => {
  let { commissionId } = req.params;

  try {
    // Save the commission details
    const commission = await Commission.findByIdAndUpdate(
        commissionId,
      {
        isDeleted: true,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      status: 200,
      message: "commission Deleted Successfully",
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
