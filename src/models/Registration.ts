import mongoose, { Schema, Document } from 'mongoose';
import { IRegistration } from '../types';

export interface RegistrationDocument extends IRegistration, Document {}

const RegistrationSchema = new Schema<RegistrationDocument>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  github: {
    type: String,
    required: true,
    trim: true,
  },
  discord: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

RegistrationSchema.index({ email: 1 });
RegistrationSchema.index({ status: 1 });

export default mongoose.model<RegistrationDocument>('Registration', RegistrationSchema);
