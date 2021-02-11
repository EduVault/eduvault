import mongoose from 'mongoose';
import { MONGO_URI, MONGO_DB_NAME } from '../config';

const connectDB = () => {
  try {
    console.log('connecting', MONGO_DB_NAME, MONGO_URI);
    const db = mongoose.connection;
    mongoose.connect(MONGO_URI, {
      dbName: MONGO_DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    db.on('error', (err) => {
      throw new Error(err);
    });
    db.on('connected', () => console.log('connected to mongo'));
    db.on('diconnected', () => console.log('Mongo is disconnected'));
    db.on('open', () => console.log('Connection Made!'));
    return db;
  } catch (connectionError) {
    console.log({ connectionError });
  }
};
export default connectDB;
