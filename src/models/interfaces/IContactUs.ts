// interfaces/IContactUs.ts
import { Document } from 'mongoose';

export interface IContact {
  name: string;
  email: string;
  subject?: string;
  message: string;
  isReplied?: boolean;
  reply?: string;
  createdAt?: Date;
}

