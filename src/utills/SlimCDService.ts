// services/slimcdService.ts
import axios from "axios";
import dotenv from "dotenv";
import getConfig from "../config/loadConfig";

const config = getConfig();
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
    username: (await config).SLIMCD_USERNAME  || "",
    password: (await config).SLIMCD_PASSWORD || "",
    clientid: (await config).SLIMCD_CLIENTID || "",
    siteid: (await config).SLIMCD_SITEID || "",
    priceid: (await config).SLIMCD_PRICEID  || "",
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
      (await config).SLIMCD_API_URL || "",
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
