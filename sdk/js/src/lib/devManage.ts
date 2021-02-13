import axios, { AxiosRequestConfig } from 'axios';

import { URL_API, ROUTES } from '../config';
import { types } from '../types';

import { hash } from './utils';
type DevVerifyReq = types.DevVerifyReq;
type AppRegisterReq = types.AppRegisterReq;

export const devVerify = async (appSecret: string, devID: string) => {
  try {
    const postData: DevVerifyReq = { appSecret, devID };
    const options: AxiosRequestConfig = {
      url: URL_API + ROUTES.DEV_VERIFY,
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-Proto': 'https',
      },
      data: postData,
      method: 'POST',
    };
    const res = await axios(options);
    const resData = res.data;
    console.log('/dev/verify', resData);
    return resData;
  } catch (error) {
    console.log({ error });
    return null;
  }
};

export const appRegister = async (
  accountID: string,
  password: string,
  name: string,
  description?: string,
  appID?: string
) => {
  try {
    const postData: AppRegisterReq = {
      accountID,
      password: hash(password),
      name,
      description,
      appID,
    };
    const options: AxiosRequestConfig = {
      url: URL_API + ROUTES.APP_REGISTER,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-Proto': 'https',
      },
      data: postData,
      method: 'POST',
    };
    const res = await axios(options);
    const resData = res.data;
    console.log('app register result', resData);
    if (!resData || !resData.data) return null;
    else return resData.data;
  } catch (error) {
    console.log({ error });
    return null;
  }
};
