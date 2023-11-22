import { createConversation } from "../controllers/Chat/chat.controller";
import { createNotification } from "../controllers/Notifications/Notification.controller";
import { ObjectId } from "../helper/RequestHelper";
import Booking from "../models/booking.model";
import Chat from "../models/chat.model";
import Expert from "../models/experts.model";
import { NotificationType } from "../utils/NotificationType";
import { NoticationMessage } from "../utils/notificationMessageConstant";

export const makeStatusFromConfirmedToCompleted = async () => {
  try {
    const todaysDate = new Date();
    const getBooking = await Booking.updateMany(
      { status: "CONFIRMED", startTime: { $lt: todaysDate } },
      { status: "COMPLETED" }
    );
    const ReqBooking = await Booking.updateMany(
      {
        status: { $in: ["REQUESTED", "ACCEPTED"] },
        endTime: { $lt: todaysDate },
      },
      { status: "CANCELLED" }
    );
    const booking = await Booking.find({
      status: "CONFIRMED",
      startTime: { $lt: todaysDate },
    });
    for (let book of booking) {
      await Chat.findOneAndUpdate(
        { booking: ObjectId(book._id) },
        { isClosed: true }
      );
    }
    console.log(getBooking);
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
        $gt: currentTime,
      },
      // date:
      status: "CONFIRMED", // Adjust this to match your criteria for initiating chat conversations
    });
    console.log(new Date(currentTime.getTime() + 15 * 60000));
    console.log(currentTime, "currentTime");
    console.log(upcomingBookings, "upcoming booking");
    // Iterate over the upcoming bookings and start chat conversations
    for (const booking of upcomingBookings) {
      const checkChatCreatedOrNot = await Chat.findOne({
        booking: ObjectId(booking._id),
      });
      if (!checkChatCreatedOrNot) {
        const expert = await Expert.findOne({user:ObjectId(booking.expert.toString())});
        const agency = expert && expert.agency ? expert.agency : null;
        const convo = await createConversation(
          [
            ObjectId(booking.expert.toString()),
            ObjectId(booking.user.toString()),
          ],
          booking._id,
          agency

        );
        console.log(convo, "convo");
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
