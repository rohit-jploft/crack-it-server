import { Request, Response } from "express";
import PromoCode, { PromoCodeDocument } from "../../models/promoCode.model";
import { promoCodeSchema } from "../../schemas/wallet.schema";
import { ObjectId } from "../../helper/RequestHelper";
import { pagination } from "../../helper/pagination";
import Booking from "../../models/booking.model";
import BookingPayment from "../../models/bookingPayment.model";

export const createPromoCode = async (req: Request, res: Response) => {
  try {
    const data: PromoCodeDocument = req.body;

    // Validate the request data using Joi schema
    const { value, error } = promoCodeSchema.validate(data);

    // Return if there's a validation error
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.message,
      });
    }

    const check = await PromoCode.findOne({ code: value.code });

    if (check) {
      return res.status(200).json({
        success: false,
        status: 200,
        message: "Promo code should be unique",
      });
    }
    // Create a new Promo Code document and save it to the database
    else {
      const promoCode = await PromoCode.create(value);

      return res.status(201).json({
        status: 200,
        success: true,
        data: promoCode,
        message: "Promo Code created successfully",
      });
    }
  } catch (error: any) {
    // Handle any errors that occur during the creation process
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
// Get all Promo Codes
export const getAllPromoCodes = async (req: Request, res: Response) => {
  let { search, isActive } = req.query;
  let query: any = { isDeleted: false };

  const currentPage = Number(req?.query?.page) + 1 || 1;
  let limit = Number(req?.query?.limit) || 10;
  const skip = limit * (currentPage - 1);

  if (search) query.code = { $regex: search, $options: "i" };
  if (isActive) query.isActive = isActive == "Active" ? true : false;

  try {
    // Retrieve all Promo Codes from the database
    const promoCodes = await PromoCode.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalCount = await PromoCode.countDocuments(query);
    return res.status(200).json({
      status: 200,
      success: true,
      data: promoCodes,
      pagination: pagination(totalCount, currentPage, limit),
    });
  } catch (error: any) {
    // Handle any errors that occur during the retrieval process
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
// Get a single Promo Code by ID
export const getPromoCodeById = async (req: Request, res: Response) => {
  try {
    const { promoCodeId } = req.params;

    // Retrieve a Promo Code by ID from the database
    const promoCode = await PromoCode.findById(promoCodeId);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Promo Code not found",
      });
    }

    return res.status(200).json({
      status: 200,
      success: true,
      data: promoCode,
    });
  } catch (error: any) {
    // Handle any errors that occur during the retrieval process
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
// Update a Promo Code by ID
export const updatePromoCodeById = async (req: Request, res: Response) => {
  try {
    const promoCodeId = req.params.promoCodeId;
    const updateData: PromoCodeDocument = req.body;

    // Validate the request data using Joi schema
    const { value, error } = promoCodeSchema.validate(updateData);

    // Return if there's a validation error
    if (error) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.message,
      });
    }

    // Update the Promo Code by ID and return the updated Promo Code
    const updatedPromoCode = await PromoCode.findOne({
      _id: ObjectId(promoCodeId),
    });

    console.log(updatedPromoCode);
    if (!updatedPromoCode) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Promo Code not found",
      });
    }
    updatedPromoCode.code = value.code;
    updatedPromoCode.discountPercentage = value.discountPercentage;
    updatedPromoCode.type = value.type;
    updatedPromoCode.flatAmount = value.flatAmount;
    updatedPromoCode.expirationDate = value.expirationDate;

    await updatedPromoCode.save();

    return res.status(200).json({
      status: 200,
      success: true,
      data: updatedPromoCode,
      message: "Promo Code updated successfully",
    });
  } catch (error: any) {
    // Handle any errors that occur during the update process
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
export const makeActive = async (req: Request, res: Response) => {
  const { promoCodeId } = req.params;
  const { isActive } = req.body;
  try {
    const code = await PromoCode.findByIdAndUpdate(
      ObjectId(promoCodeId),
      {
        isActive: isActive,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      status: 200,
      data: code,
      message: "Promo code is " + isActive ? " Active" : " Inactive",
    });
  } catch (error: any) {
    // Handle any errors that occur during the update process
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
// Delete a Promo Code by ID
export const deletePromoCodeById = async (req: Request, res: Response) => {
  try {
    const promoCodeId = req.params.id;

    // Delete the Promo Code by ID and return a success message
    const deletedPromoCode = await PromoCode.findByIdAndRemove(promoCodeId);

    if (!deletedPromoCode) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Promo Code not found",
      });
    }

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Promo Code deleted successfully",
    });
  } catch (error: any) {
    // Handle any errors that occur during the deletion process
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
// Sample function to validate a Promo Code (customize as needed)
export const validatePromoCode = async (req: Request, res: Response) => {
  try {
    const { promoCode, bookingId } = req.body;

    const getPromoCode = await PromoCode.findOne({
      isActive: true,
      code: promoCode,
      expirationDate: { $lte: new Date() },
    });
    console.log(getPromoCode, "code object from db");
    if (getPromoCode) {
      const bookingPayment: any = await BookingPayment.findOne({
        booking: ObjectId(bookingId),
      });
      console.log(bookingPayment)
      if (bookingPayment && bookingPayment.promoCode ===null) {
        let discount;
        discount =
          getPromoCode.type === "FLAT"
            ? getPromoCode.flatAmount
            : (getPromoCode.discountPercentage * bookingPayment?.grandTotal) /
              100;

        bookingPayment.grandTotal = bookingPayment.grandTotal - discount;
        bookingPayment.discountAmount = discount;

        bookingPayment.promoCode = getPromoCode._id;
        bookingPayment.d = getPromoCode._id;
        await bookingPayment.save();
        console.log(getPromoCode);
        console.log(getPromoCode);
        return res.status(200).json({
          success: true,
          type: "success",
          data: getPromoCode,
          message: "Promo Code is valid",
        });
      } else {
        return res.status(200).json({
          success: false,
          type: "success",
          message: "Promo Code is already applied",
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        status: 200,
        type: "error",
        message: "Promo Code is invalid",
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
export const removePromoCode = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;

    const bookingPayment: any = await BookingPayment.findOne({
      booking: ObjectId(bookingId),
    });

    if (bookingPayment && bookingPayment.promoCode) {
      let discount = bookingPayment.discountAmount;

      bookingPayment.grandTotal = bookingPayment.grandTotal + discount;
      bookingPayment.discountAmount = 0;
      bookingPayment.promoCode = null;
      await bookingPayment.save();

      return res.status(200).json({
        success: true,
        status: 200,
        message: "Promo code removed successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        status: 200,
        message: "No promo code applied on this booking ",
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
export const deletePromoCode = async (req: Request, res: Response) => {
  const { promoCodeId } = req.params;
  const { isDeleted } = req.body;
  try {
    const code = await PromoCode.findByIdAndUpdate(
      ObjectId(promoCodeId),
      {
        isDeleted: isDeleted,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Promo code is deleted",
    });
  } catch (error: any) {
    // Handle any errors that occur during the update process
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
