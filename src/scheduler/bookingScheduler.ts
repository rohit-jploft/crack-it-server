import { createConversation } from "../controllers/Chat/chat.controller";
import { createNotification } from "../controllers/Notifications/Notification.controller";
import { createTransaction } from "../controllers/Wallet/wallet.controller";
import { ObjectId } from "../helper/RequestHelper";
import { getSuperAdminId } from "../helper/impFunctions";
import Booking from "../models/booking.model";
import BookingPayment from "../models/bookingPayment.model";
import Chat from "../models/chat.model";
import Expert from "../models/experts.model";
import { NotificationType } from "../utils/NotificationType";
import { NoticationMessage } from "../utils/notificationMessageConstant";

export const makeStatusFromConfirmedToCompleted = async () => {
  try {
    const todaysDate = new Date();

    const ReqBooking = await Booking.updateMany(
      {
        status: { $in: ["REQUESTED", "ACCEPTED"] },
        endTime: { $lt: todaysDate },
      },
      { status: "CANCELLED" }
    );
    const booking = await Booking.find({
      status: "CONFIRMED",
      endTime: { $lt: todaysDate },
    });
    const superAdminId = await getSuperAdminId();
    for (let book of booking) {
      const bookingPayment: any = await BookingPayment.findOne({
        booking: ObjectId(book._id),
      });
      // await Chat.findOneAndUpdate(
      //   { booking: ObjectId(book._id) },
      //   { isClosed: true }
      // );
      await createTransaction(
        bookingPayment?.totalAmount,
        "CREDIT",
        book.expert,
        superAdminId,
        "Booking Payment"
      );
    }
    const getBooking = await Booking.updateMany(
      { status: "CONFIRMED", endTime: { $lt: todaysDate } },
      { status: "COMPLETED" }
    );
    return getBooking;
  } catch (error) {
    return error;
  }
};

export const startChatForConfirmedBookingBefore15Min = async () => {
  const currentTime = new Date();
  try {
    // Find upcoming bookings where the chat should be started
    const upcomingBookings = await Booking.find({
      startTime: {
        $lte: new Date(currentTime.getTime() + 15 * 60000),
        $gte: currentTime,
      },
      // endTime: {
      //   $gt: currentTime,
      // },
      // date:
      status: "CONFIRMED", // Adjust this to match your criteria for initiating chat conversations
    });
    // Iterate over the upcoming bookings and start chat conversations
    for (const booking of upcomingBookings) {
      const checkChatCreatedOrNot = await Chat.findOne({
        booking: ObjectId(booking._id),
      });
      if (!checkChatCreatedOrNot) {
        const expert = await Expert.findOne({
          user: ObjectId(booking.expert.toString()),
        });
        const agency = expert && expert.agency ? expert.agency : null;
        const convo = await createConversation(
          [
            ObjectId(booking.expert.toString()),
            ObjectId(booking.user.toString()),
          ],
          booking._id,
          agency
        );
        if (convo && convo.isNew) {
          await createNotification(
            ObjectId(booking.expert.toString()),
            ObjectId(booking.user.toString()),
            NoticationMessage.ChatInitiated.title,
            NotificationType.Booking,
            "web",
            NoticationMessage.ChatInitiated.message,
            { targetId: booking._id }
          );
          await createNotification(
            ObjectId(booking.user.toString()),
            ObjectId(booking.expert.toString()),
            NoticationMessage.ChatInitiated.title,
            NotificationType.Booking,
            "web",
            NoticationMessage.ChatInitiated.message,
            { targetId: booking._id }
          );
        }
      }
    }
  } catch (error) {
    return error;
  }
};

export const markChatClosedAfterTheMeeting = async () => {
  const todayDate = new Date();
  const getBooking = await Booking.find({
    endTime: { $lt: new Date(todayDate.getTime() + 15 * 60 * 1000) },
  });
  for (let book of getBooking) {
    const chatsDoc = await Chat.findOneAndUpdate(
      { booking: ObjectId(book._id) },
      { isClosed: true }
    );
  }
};
