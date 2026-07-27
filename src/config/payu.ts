import dotenv from "dotenv";
dotenv.config();

const merchantKey = process.env.PAYU_MERCHANT_KEY || "gtKpxx";
const merchantSalt = process.env.PAYU_MERCHANT_SALT || "eCwWELSp";
const baseUrl = process.env.PAYU_BASE_URL || "https://test.payu.in";
const successUrl = process.env.PAYU_SUCCESS_URL || "http://localhost:5000/api/v1/payments/payu/success";
const failureUrl = process.env.PAYU_FAILURE_URL || "http://localhost:5000/api/v1/payments/payu/failure";
const frontendSuccessUrl = process.env.FRONTEND_PAYMENT_SUCCESS_URL || "http://localhost:3000/payment/success";
const frontendFailureUrl = process.env.FRONTEND_PAYMENT_FAILURE_URL || "http://localhost:3000/payment/failure";

export const payuConfig = {
  merchantKey,
  merchantSalt,
  baseUrl,
  successUrl,
  failureUrl,
  frontendSuccessUrl,
  frontendFailureUrl,
  isConfigured: !!(merchantKey && merchantSalt),
};
