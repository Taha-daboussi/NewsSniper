// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  discordTag: string;
  binanceApiKey?: string;
  binanceApiSecret?: string;
  bybitApiKey?: string;
  bybitApiSecret?: string;
  amount?: number; // Add this field for the amount
}

const UserSchema: Schema = new Schema({
  discordTag: { type: String, required: true, unique: true },
  binanceApiKey: { type: String },
  binanceApiSecret: { type: String },
  bybitApiKey: { type: String },
  bybitApiSecret: { type: String },
  amount: { type: Number, default: 0 }, // Add this field for the amount
});

export default mongoose.model<IUser>('User', UserSchema);
