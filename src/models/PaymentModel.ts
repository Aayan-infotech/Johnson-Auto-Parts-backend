// models/payment.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { PaymentRecord } from "./interfaces/IPayment";

interface PaymentDocument extends PaymentRecord, Document {}

const paymentSchema: Schema = new Schema<PaymentDocument>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  amount: { type: Number, required: true },
  cardLast4: { type: String, required: true },
  invoiceno: { type: String, required: true },
  refid: { type: String, required: true },
  product: { type: String, required: true },
  status: { type: String, required: true },
  slimcdResponse: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<PaymentDocument>("Payment", paymentSchema);
