// interfaces/payment.interface.ts
export interface PaymentData {
    amount: number;
    cardnumber: string;
    expmonth: string;
    expyear: string;
  }
  
  export interface PaymentRecord {
    userId?: string; // optional if payment is made anonymously
    amount: number;
    cardLast4: string;
    invoiceno: string;
    refid: string;
    product: string;
    status: string;
    slimcdResponse: any;
    createdAt?: Date;
  }
  