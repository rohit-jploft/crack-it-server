import { Response } from "express";
import mongoose, { Types } from "mongoose";
import Joi from "joi";

type Pagination  = {
  page: number;
  pageSize: number;
  total: number;
}

type ErrorData = {
  message: string;
}

type SuccessData =  {
  statusCode: number;
  message: string;
  data: any;
  pagination?: Pagination;
}

type Result = SuccessData | ErrorData;

const buildResult = (
  res: Response,
  status: number,
  result: any,
  pagination?: Pagination,
  error?: ErrorData,
  message?: string
): Response => {
  if (error) {
    // Generate error response
    return res.status(status).json({
      statusCode: status,
      message: error.message,
      data: {},
    });
  } else {
    // Generate success response
    return res.status(status).json({
      statusCode: status,
      message: message ? message : "SUCCESS",
      data: result,
      pagination: pagination,
    });
  }
};

const ObjectId = (id: string):Types.ObjectId => {
  return new mongoose.Types.ObjectId(id);
};



export {  ObjectId, buildResult };
