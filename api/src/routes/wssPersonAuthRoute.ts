import Router from 'koa-router';
import Emittery from 'emittery'; // use the emitter to send events to ourself (the challenge)
import { UserAuth as PersonAuth } from '@textile/security';
import Koa from 'koa';
import websockify from 'koa-websocket';

import { newClientDB, getAPISig } from '../textile/helpers';
import Person, { IPerson } from '../models/person';
import { validateJwt } from '../utils/jwt';
import { TEXTILE_USER_API_KEY } from '../config';
import { DefaultState, Context, Middleware } from 'koa';

interface wsMessageData {
  jwt?: string;
  type:
    | 'keys-request'
    | 'keys-response'
    | 'token-request'
    | 'token-response'
    | 'challenge-request'
    | 'challenge-response'
    | 'error';
  accountID: IPerson['accountID'];
  signature: string;
  error: string;
}
const router = new Router<DefaultState, Context>();
const personAuthRoute = (app: websockify.App<Koa.DefaultState, Koa.DefaultContext>) => {
  router.get('/ws/auth', (ctx) => {
    const emitter = new Emittery();
    ctx.websocket.on('message', async (msg) => {
      console.log('=================wss message===================', msg);

      try {
        const data = JSON.parse(msg.toString());
        if (!data.jwt) {
          throw new Error('missing jwt');
        }
        const jwtCheck = await validateJwt(data.jwt);
        console.log('jwtCheck', !!jwtCheck);
        if (!jwtCheck || !jwtCheck.pubKey || !jwtCheck.accountID) {
          throw new Error('invalid jwt');
        }
        const person = jwtCheck;
        switch (data.type) {
          case 'keys-request': {
          }
          case 'token-request': {
            const pubKey = person.pubKey;
            if (!pubKey) {
              throw new Error('missing pubkey');
            }
            const db = await newClientDB();
            const token = await db.getTokenChallenge(pubKey, (challenge: Uint8Array) => {
              return new Promise((resolve, reject) => {
                let response = {} as any;
                response.type = 'challenge-request';
                response.value = Buffer.from(challenge).toJSON();
                ctx.websocket.send(JSON.stringify(response));
                let recieved = false;
                /** Wait for the challenge event from our event emitter */
                emitter.on('challenge-response', (signature: string) => {
                  recieved = true;
                  // console.log('challenge-response signature', signature);
                  resolve(Buffer.from(signature));
                });
                setTimeout(() => {
                  reject();
                  if (!recieved) {
                    console.log('client took too long to respond');
                  }
                }, 10000);
              });
            });
            /**
             * The challenge was successfully completed by the client
             */
            console.log('challenge completed');
            const apiSig = await getAPISig(5000);
            const personAuth: PersonAuth = {
              ...apiSig,
              token: token,
              key: TEXTILE_USER_API_KEY,
            };
            ctx.websocket.send(
              JSON.stringify({
                type: 'token-response',
                value: personAuth,
              }),
            );
            break;
          }
          /** Waiting for a response from the client to the challenge above.
           * result will get sent back to resolve on the line: emitter.on('challenge', (signature) => {
           */
          case 'challenge-response': {
            if (!data.signature) {
              throw new Error('missing signature');
            }
            console.log('got signature response');
            await emitter.emit('challenge-response', data.signature);
            break;
          }
        }
      } catch (error) {
        console.log(error);
        /** Notify our client of any errors */
        ctx.websocket.send(
          JSON.stringify({
            type: 'error',
            value: error.message,
          }),
        );
      }
    });
  });
  //@ts-ignore
  app.ws.use(router.routes()).use(router.allowedMethods());
};
export default personAuthRoute;
