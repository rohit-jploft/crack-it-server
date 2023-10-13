import { createConversation } from "../controllers/Chat/chat.controller";
import { ObjectId } from "../helper/RequestHelper";
import Booking from "../models/booking.model";

export const makeStatusFromConfirmedToCompleted = async () => {
  try {
    const todaysDate = new Date();
    const getBooking = await Booking.updateMany(
      { status: "CONFIRMED", date: { $lt: todaysDate } },
      { status: "COMPLETED" }
    );
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
      status: "CONFIRMED", // Adjust this to match your criteria for initiating chat conversations
    });
    // Iterate over the upcoming bookings and start chat conversations
    for (const booking of upcomingBookings) {
      const convo = await createConversation(
        [
          ObjectId(booking.expert.toString()),
          ObjectId(booking.user.toString()),
        ],
        booking._id
      );
    }
  } catch (error) {
    return error;
  }
};
