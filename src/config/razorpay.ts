import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_SrCd8TuB4aoVkY";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "MEPHf9H5gWLlkTqr4aqSNMw7";

let instance: Razorpay | null = null;

if (!keyId || !keySecret) {
  console.warn(
    "WARNING: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set in environment variables. Razorpay integration will throw errors if payment is triggered.",
  );
} else {
  try {
    instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } catch (err) {
    console.error("Failed to initialize Razorpay SDK:", err);
  }
}

export const razorpayInstance = instance;

export const razorpayConfig = {
  keyId: keyId || "",
  keySecret: keySecret || "",
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  isConfigured: !!(keyId && keySecret),
};
