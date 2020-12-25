import Router from 'koa-router';
import * as KoaPassport from 'koa-passport';
import User, { IUser, hashPassword } from '../models/user';
import { DefaultState, Context } from 'koa';
import { PasswordRes } from '../types';
import { ROUTES, CLIENT_CALLBACK, APP_SECRET, JWT_EXPIRY } from '../utils/config';
import { createJwt, validateJwt } from '../utils/jwt';
const local = function (router: Router<DefaultState, Context>, passport: typeof KoaPassport) {
    async function signup(ctx: Context) {
        const data = ctx.request.body;
        const previousUser = await User.findOne({
            username: data.username,
        });
        if (previousUser) {
            ctx.unauthorized({ error: 'user already exists' }, 'user already exists');
            return;
        }
        if (
            !data.password ||
            !data.username ||
            !data.encryptedKeyPair ||
            !data.pubKey ||
            !data.threadIDStr
        ) {
            ctx.unauthorized({ error: 'invalid signup' }, 'invalid signup');
            return;
        }
        const newUser = new User();
        newUser.username = data.username;
        newUser.password = hashPassword(data.password);
        newUser.encryptedKeyPair = data.encryptedKeyPair;
        newUser.pubKey = data.pubKey;
        newUser.threadIDStr = data.threadIDStr;
        // console.log('data', data);
        console.log('new user', newUser.toJSON());
        newUser.save();
        await ctx.login(newUser);
        ctx.session.jwt = createJwt(newUser.username);
        await ctx.session.save();
        ctx.oK(
            {
                encryptedKeyPair: newUser.encryptedKeyPair,
                jwt: ctx.session.jwt,
                pubKey: newUser.pubKey,
                threadIDStr: newUser.threadIDStr,
            },
            null,
        );
    }

    router.post(ROUTES.LOCAL, async (ctx, next) => {
        const user = await User.findOne({ username: ctx.request.body.username });
        if (!user) return signup(ctx);
        else
            return passport.authenticate('local', async (err: string, user: IUser) => {
                if (err) {
                    ctx.unauthorized(err, err);
                } else {
                    await ctx.login(user);
                    ctx.session.jwt = createJwt(user.username);
                    await ctx.session.save();
                    const returnData = {
                        encryptedKeyPair: user.encryptedKeyPair,
                        jwt: ctx.session.jwt,
                        pubKey: user.pubKey,
                        threadIDStr: user.threadIDStr,
                    };
                    // console.log('login authorized. returnData', returnData);
                    ctx.oK(returnData, null);
                }
            })(ctx, next);
    });
    return router;
};
export default local;
