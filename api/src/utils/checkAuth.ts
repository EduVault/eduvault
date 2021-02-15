import { DefaultState, Context, Middleware } from 'koa';

const checkAuth: Middleware = (ctx, next) => {
  console.log('cookie exists', !!ctx.cookie);
  console.log('session', ctx.session.toJSON());
  if (!ctx.isAuthenticated()) {
    ctx.unauthorized(null, 'unautharized');
  } else {
    return next();
  }
};

export default checkAuth;
