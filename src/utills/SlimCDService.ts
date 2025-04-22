// services/slimcdService.ts
import axios from "axios";
import dotenv from "dotenv";
import getConfig from "../config/loadConfig";
import Payment from "../models/PaymentModel";
import { PaymentData, PaymentRecord } from "../models/interfaces/IPayment";

dotenv.config();

export const makePayment = async (
  paymentData: PaymentData,
  userId?: string
): Promise<any> => {
  const configData = await getConfig();
  const invoiceno = `INV-${Date.now()}`;
  const refid = `REF-${Date.now()}`;

  const payload = {
    username: configData.SLIMCD_USERNAME,
    password: configData.SLIMCD_PASSWORD,
    clientid: configData.SLIMCD_CLIENTID,
    siteid: configData.SLIMCD_SITEID,
    priceid: configData.SLIMCD_PRICEID,
    transtype: "SALE",
    amount: paymentData.amount,
    cardnumber: paymentData.cardnumber,
    expmonth: paymentData.expmonth,
    expyear: paymentData.expyear,
    invoiceno,
    refid,
    product: "MyNodeApp",
    ver: "1.0",
  };

  try {
    const response = await axios.post(
      configData.SLIMCD_API_URL,
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000,
      }
    );
      console.log(response,"response in slim cd")
    const paymentRecord: PaymentRecord = {
      userId,
      amount: paymentData.amount,
      cardLast4: paymentData.cardnumber.slice(-4),
      invoiceno,
      refid,
      product: "MyNodeApp",
      status: response.data.reply.response || "UNKNOWN",
      slimcdResponse: response.data,
    };

    await Payment.create(paymentRecord);

    return response.data;
  } catch (err: any) {
    console.error("SlimCD payment error:", err);
    throw new Error("Payment failed");
  }
};
