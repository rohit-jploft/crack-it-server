import { Request, Response } from "express";
import Contact from "../../models/contact.model";
import { contactJoiSchema } from "../../schemas/contact.schema";
import { pagination } from "../../helper/pagination";

export const createContactLead = async (req: Request, res: Response) => {
  const data = req.body;

  const { error, value } = contactJoiSchema.validate(data);
  if (error) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: error.message,
    });
  }
  try {
    const contact = await Contact.create({ ...value });

    return res.status(200).json({
      status: 200,
      success: true,
      data: contact,
      message: "Contact submitted successfully",
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

export const getAllContactUs = async (req: Request, res: Response) => {
  const { search } = req.query;
  var query: any = {};

  const currentPage = Number(req?.query?.page) + 1 || 1;
  let limit = Number(req?.query?.limit) || 10;
  const skip = limit * (currentPage - 1);

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }
  try {
    const contacts = await Contact.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalCount = await Contact.countDocuments(query);
    return res.status(200).json({
      status: 200,
      success: true,
      data: contacts,
      pagination: pagination(totalCount, currentPage, limit),
      message: "Contact fetched successfully",
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
