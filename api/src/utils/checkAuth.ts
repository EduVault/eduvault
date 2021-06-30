import { DefaultState, Context, Middleware } from 'koa';
import { isTestEnv } from '../utils';

const checkAuth: Middleware = (ctx, next) => {
  if (!ctx.isAuthenticated()) {
    ctx.unauthorized(null, 'unauthorized');
  } else {
    return next();
  }
};

export default checkAuth;
