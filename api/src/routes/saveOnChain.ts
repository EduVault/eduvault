import Router from 'koa-router';
import * as KoaPassport from 'koa-passport';
import { DefaultState, Context } from 'koa';
import axios, { AxiosRequestConfig } from 'axios';
import { ROUTES, CLIENT_CALLBACK, DOTWALLET_APP_ID, DOTWALLET_SECRET } from '../utils/config';
import TxList, { IRecord } from '../models/txlist';
import { createJwt } from '../utils/jwt';
import checkAuth from './checkAuth';

const saveOnChain = function (router: Router<DefaultState, Context>) {
    router.post('/save-data', checkAuth, async (ctx) => {
        try {
            const data = ctx.request.body;
            // check if recieve address is dev's own
            console.log('==============data==============\n', data);
            const getHostedOptions: AxiosRequestConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    appid: DOTWALLET_APP_ID,
                    appsecret: DOTWALLET_SECRET,
                },
                method: 'POST',
                data: {
                    coin_type: 'BSV',
                },
            };
            const getHostedAccount = await axios(
                'https://www.ddpurse.com/platform/openapi/v2/get_hosted_account',
                getHostedOptions,
            );
            const getHostedData = getHostedAccount.data;
            console.log('==============getHostedData==============', getHostedData);
            if (!getHostedData.data.address) {
                throw getHostedData.msg;
            }
            const getBalanceOptions: AxiosRequestConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    appid: DOTWALLET_APP_ID,
                    appsecret: DOTWALLET_SECRET,
                },
                method: 'POST',
                data: {
                    coin_type: 'BSV',
                },
            };
            const getBalance = await axios(
                'https://www.ddpurse.com/platform/openapi/v2/get_hosted_account_balance',
                getBalanceOptions,
            );
            const getBalanceData = getBalance.data;
            console.log('==============getBalanceData==============', getBalanceData);
            if (!getBalanceData.data.confirm && getBalanceData.data.confirm !== 0) {
                console.log(
                    'getBalanceData.data.confirm;, getBalanceData.data.confirm;',
                    getBalanceData.data.confirm,
                );
                throw getBalanceData;
            }

            if (getBalanceData.data.confirm + getBalanceData.data.unconfirm < 700)
                throw 'developer wallet balance too low';
            const saveDataOptions: AxiosRequestConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    appid: DOTWALLET_APP_ID,
                    appsecret: DOTWALLET_SECRET,
                },
                method: 'POST',
                data: {
                    coin_type: 'BSV',
                    data: JSON.stringify(data),
                    data_type: 0,
                },
            };
            const saveData = await axios(
                'https://www.ddpurse.com/platform/openapi/v2/push_chain_data',
                saveDataOptions,
            );
            const saveDataData = saveData.data;
            console.log('==============saveDataData==============', saveDataData);
            const txlist = await TxList.findOne({ title: 'main' });
            console.log('txlist', txlist);
            if (!txlist) {
                const newtxlist = new TxList();
                newtxlist.title = 'main';
                newtxlist.list = [];
                newtxlist.list.push(saveDataData.data.txid);
                newtxlist.save();
            } else {
                txlist.list.push(saveDataData.data.txid);
                txlist.save();
            }
            ctx.oK(txlist.list);
        } catch (err) {
            console.log('==============err==============\n', err);
            ctx.internalServerError(err);
        }
    });
    router.get('/txlist', checkAuth, async (ctx) => {
        const txlist = await TxList.findOne({ title: 'main' });
        if (!txlist) {
            ctx.noContent();
        } else ctx.oK(txlist.list);
    });

    return router;
};
export default saveOnChain;
