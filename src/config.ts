import Razorpay from "razorpay";

export const rzp_instance = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY_ID!,
  key_secret: process.env.RAZOR_PAY_KEY_SECRET,
  headers: {
    // "X-Razorpay-Account": process.env.RAZOR_PAY_MERCHANT_ID
  },
});
