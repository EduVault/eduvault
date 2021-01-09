import { APP_SECRET, JWT_EXPIRY } from '../config';
import User, { IUser } from '../models/user';
import jwt from 'jsonwebtoken';

export const createJwt = (username: IUser['username']) =>
  jwt.sign({ data: { username: username } }, APP_SECRET, { expiresIn: JWT_EXPIRY });

export const validateJwt = async (token: string) => {
  try {
    const decoded: any = jwt.verify(token, APP_SECRET);
    const exp = new Date(decoded.exp * 1000);
    const now = new Date();
    const valid = now < exp;
    const user = await User.findOne({ username: decoded.data.username });
    if (user && valid) {
      return user;
    } else {
      return false;
    }
  } catch (err) {
    console.log('err', err);
    return false;
  }
};
