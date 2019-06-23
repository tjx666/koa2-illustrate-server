const Koa = require('koa');
const Router = require('koa-router');
const mime = require('mime');
const fs = require('fs-extra');
const Path = require('path');

const app = new Koa();
const router = new Router();

const responseFile = async (path, context, encoding) => {
    const fileContent = await fs.readFile(path, encoding);
    context.type = mime.getType(path);
    context.body = fileContent;
};

// 处理首页
router.get(/(^\/index(.html)?$)|(^\/$)/, async (ctx, next) => {
    await responseFile(Path.resolve(__dirname, './index.html'), ctx, 'UTF-8');
    await next();
});

// 处理图片
router.get(/\S*\.(jpe?g|png)$/, async (ctx, next) => {
    const { request, response, path } = ctx;
    response.set('pragma', 'no-cache');

    // max-age 值是精确到秒，设置过期时间为 1 分钟
    // response.set('cache-control', `max-age=${1 * 60}`);
    // 添加 expires 字段到响应头，过期时间 2 分钟
    // response.set('expires', new Date(Date.now() + 2 * 60 * 1000).toString());

    const imagePath = Path.resolve(__dirname, `.${path}`);
    const ifModifiedSince = request.headers['if-modified-since'];
    const imageStatus = await fs.stat(imagePath);
    const lastModified = imageStatus.mtime.toGMTString();
    if (ifModifiedSince === lastModified) {
        response.status = 304;
    } else {
        response.lastModified = lastModified;
        await responseFile(imagePath, ctx);
    }

    await next();
});

// 处理 css 文件
router.get(/\S*\.css$/, async (ctx, next) => {
    const { path } = ctx;
    await responseFile(Path.resolve(__dirname, `.${path}`), ctx, 'UTF-8');
    await next();
});

app
    .use(router.routes())
    .use(router.allowedMethods());


app.listen(3000);
process.on('unhandledRejection', (err) => {
    console.error('有 promise 没有 catch', err);
});
