import Router from 'koa-router';
import websockify from 'koa-websocket';

import Koa from 'koa';
import * as KoaPassport from 'koa-passport';
import local from './local';
import facebook from './facebook';
import google from './google';
import dotwallet from './dotwallet';
import saveOnChain from './saveOnChain';
import checkAuth from './checkAuth';
import { DefaultState, Context, Middleware } from 'koa';
import { CLIENT_CALLBACK } from '../utils/config';
import getUser from '../utils/getUserFromSession';

const startRouter = (
    app: websockify.App<Koa.DefaultState, Koa.DefaultContext>,
    passport: typeof KoaPassport,
) => {
    const router = new Router<DefaultState, Context>();
    router.get('/ping', async (ctx) => {
        ctx.oK(null, 'pong!');
    });

    router.get('/get-user', checkAuth, async (ctx) => {
        // console.log('++++++++++++++++++get user+++++++++++++++++++');
        const user = await (await getUser(ctx.session.toJSON())).toObject();
        if (!user) ctx.internalServerError('user not found');
        // console.log(user);
        ctx.oK({ ...user, jwt: ctx.session.jwt });
    });
    router.get('/logout', async (ctx) => {
        ctx.session = null;
        ctx.logout();
        ctx.oK();
    });
    router.get('/auth-check', checkAuth, (ctx) => {
        ctx.oK(null, 'ok');
    });
    router.post('/save-thread-id', checkAuth, async (ctx) => {
        const user = await getUser(ctx.session.toJSON());
        if (!user) ctx.internalServerError('user not found');
        // console.log(user);
        if (user.threadIDStr) ctx.oK({ threadIDStr: user.toObject().threadIDStr, exists: true });
        user.threadIDStr = ctx.request.body.threadIDStr;
        await user.save();
        ctx.oK({ threadIDStr: user.threadIDStr });
    });
    router.post('/upload-db-info', checkAuth, async (ctx) => {
        const user = await getUser(ctx.session.toJSON());
        if (!user) ctx.internalServerError('user not found');
        // console.log(user);
        if (user.DbInfo) ctx.oK({ DbInfo: user.toObject().DbInfo, exists: true });
        user.DbInfo = ctx.request.body.DbInfo;
        await user.save();
        ctx.oK({ DbInfo: user.DbInfo });
    });
    local(router, passport);
    facebook(router, passport);
    google(router, passport);
    dotwallet(router, passport);
    saveOnChain(router);
    app.use(router.routes()).use(router.allowedMethods());
    return router;
};

export default startRouter;
