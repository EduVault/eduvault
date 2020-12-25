import mongoose from 'mongoose';
import { MONGO_URI } from '../utils/config';

const connectDb = () => {
    const db = mongoose.connection;
    mongoose.connect(MONGO_URI, { useNewUrlParser: true });

    db.on('error', console.error);
    db.on('connected', () => console.log('connected to mongo'));
    db.on('diconnected', () => console.log('Mongo is disconnected'));
    db.on('open', () => console.log('Connection Made!'));
    return db;
};
export default connectDb;
