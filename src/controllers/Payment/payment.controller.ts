import { Request, Response } from "express";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const createPaymentIntent = async (req: Request, res: Response) => {
    const { cardholderName, cardNumber, expiry, cvv } = req.body;

    // You can use the Stripe library to handle the payment
    // Make sure you have the `stripe` package installed
    const stripe = require('stripe')(stripeSecretKey);
  
    try {
      // Create a PaymentMethod for the card
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardNumber,
          exp_month: parseInt(expiry.split('-')[1]),
          exp_year: parseInt(expiry.split('-')[0]),
          cvc: cvv,
          name: cardholderName,
        },
      });
      console.log(paymentMethod)
      // Create a PaymentIntent and attach the PaymentMethod
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000, // Replace with your payment amount in cents
        currency: 'usd',
        description: 'Sample Payment',
        payment_method: paymentMethod.id,
      });
  
      // Confirm the PaymentIntent to complete the payment
      await stripe.paymentIntents.confirm(paymentIntent.id);
  
      // Handle successful payment
      res.status(200).json({ success: true, message: 'Payment successful' });
    } catch (error) {
      console.error('Payment error:', error);
      res.status(500).json({ success: false, message: 'Payment failed' });
    }
};
