export default async (ctx, next) => {
    console.log(ctx.method, ctx.path);
    await next();
};