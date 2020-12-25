import mongoose, { Schema, Document } from 'mongoose';

export interface IRecord {
    txid: string;
}
export interface ITxList extends Document {
    title: string;
    list: IRecord[];
}

const TxlistSchema = new Schema({
    title: { type: String, unique: false, required: false },
    list: { type: Array, unique: false, required: false },
});
export default mongoose.model<ITxList>('txlist', TxlistSchema);
