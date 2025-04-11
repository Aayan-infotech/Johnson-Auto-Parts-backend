// services/slimcdService.ts
import axios from 'axios';
import { parseStringPromise } from "xml2js";
const SLIMCD_URL = "https://webservices.slimcd.com/wswebservice/creditcard.asmx"; // ✅ fixed
const SLIMCD_USERNAME = "R6UT8C6M";
const SLIMCD_PASSWORD = "iamgroot"; 

interface SlimcdPaymentInput {
  amount: number;
  cardnumber: string;
  expmonth: string;
  expyear: string;
}

export async function processSlimcdPayment({
  amount,
  cardnumber,
  expmonth,
  expyear,
}: SlimcdPaymentInput) {
  const soapEnvelope = `
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                 xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <ProcessCreditCard xmlns="https://www.slimcd.com/webservices/">
        <username>${SLIMCD_USERNAME}</username>
        <password>${SLIMCD_PASSWORD}</password>
        <transtype>SALE</transtype>
        <amount>${amount.toFixed(2)}</amount>
        <cardnumber>${cardnumber}</cardnumber>
        <expmonth>${expmonth}</expmonth>
        <expyear>${expyear}</expyear>
        <product>MyProduct</product>
        <ver>1.0</ver>
      </ProcessCreditCard>
    </soap:Body>
  </soap:Envelope>
  `;

  try {
    const { data } = await axios.post(SLIMCD_URL, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'https://www.slimcd.com/webservices/ProcessCreditCard',
      },
    });

    const result = await parseStringPromise(data);

    const rawString =
      result?.["soap:Envelope"]?.["soap:Body"]?.[0]?.["ProcessCreditCardResponse"]?.[0]
        ?.["ProcessCreditCardResult"]?.[0];

    if (!rawString) throw new Error("Invalid SlimCD response");

    const [responseCode, description, authCode, transactionId] = rawString.split("|");

    return {
      response: responseCode,
      description,
      authCode,
      transactionId,
    };
  } catch (error: any) {
    console.error("SlimCD error:", error?.response?.data || error.message);
    throw new Error("Payment processing failed.");
  }
}
