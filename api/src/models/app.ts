import mongoose, { Schema, Document } from 'mongoose';
import { types } from '../types';
export interface IApp extends Document, types.IApp {}

const AppSchema = new Schema({
  appID: { type: String, unique: true, required: true },
  devID: { type: String, unique: false, required: true },
  name: { type: String, unique: true, required: true },
  description: { type: String, unique: false, required: false },
  authorizedDomains: [{ type: String, required: false, unique: false }],
  persons: [{ type: String, required: false, unique: true }],
});
export default mongoose.model<IApp>('app', AppSchema, 'app');
