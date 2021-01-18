import { APP_SECRET, JWT_EXPIRY } from '../config';
import Person, { IPerson } from '../models/person';
import jwt from 'jsonwebtoken';

export const createJwt = (accountID: IPerson['accountID']) => {
  const newJwt = jwt.sign({ data: { accountID: accountID } }, APP_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
  console.log({ newJwt });
  return newJwt;
};
export const getJwtExpiry = async (token: string) => {
  try {
    const decoded: any = jwt.verify(token, APP_SECRET);
    console.log({ decoded });
    return new Date(decoded.exp * 1000);
  } catch (err) {
    console.log('err', err);
    return false;
  }
};

export const validateJwt = async (token: string) => {
  try {
    const decoded: any = jwt.verify(token, APP_SECRET);
    const exp = new Date(decoded.exp * 1000);
    const now = new Date();
    const valid = now < exp;
    const person = await Person.findOne({ accountID: decoded.data.accountID });
    if (person && valid) {
      return person;
    } else {
      return false;
    }
  } catch (err) {
    console.log('err', err);
    return false;
  }
};
