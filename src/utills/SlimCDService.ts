// services/slimcdService.ts
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

interface PaymentData {
  amount: number;
  cardnumber: string;
  expmonth: string;
  expyear: string;
}

export const makePayment = async (paymentData: PaymentData) => {
  console.log(paymentData, "before sending data");
  const payload = {
    username: process.env.SLIMCD_USERNAME || "",
    password: process.env.SLIMCD_PASSWORD || "",
    clientid: process.env.SLIMCD_CLIENTID || "",
    siteid: process.env.SLIMCD_SITEID || "",
    priceid: process.env.SLIMCD_PRICEID || "",
    transtype: "SALE",
    amount: paymentData.amount,
    cardnumber: paymentData.cardnumber,
    expmonth: paymentData.expmonth,
    expyear: paymentData.expyear,
    invoiceno: `INV-${Date.now()}`,
    refid: `REF-${Date.now()}`,
    product: "MyNodeApp",
    ver: "1.0",
  };
  console.log(
    "🚀 Sending Payload to SlimCD:",
    JSON.stringify(payload, null, 2)
  );

  try {
    const response = await axios.post(
      process.env.SLIMCD_API_URL || "",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );
    console.log(
      "🧾 Response from SlimCD:",
      response.data
    );

    return response.data;
  } catch (err: any) {
    console.log("SlimCD payment error:", err);
    throw new Error("Payment failed");
  }
};
