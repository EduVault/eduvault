import { Middleware } from 'koa';

const checkAuth: Middleware = (ctx, next) => {
  if (!ctx.isAuthenticated()) {
    ctx.unauthorized(null, 'unauthorized');
  } else {
    return next();
  }
};

export default checkAuth;
