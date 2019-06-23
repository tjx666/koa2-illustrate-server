const Koa = require('koa');
const Router = require('koa-router');
const mime = require('mime');
const fs = require('fs-extra');
const Path = require('path');
const crypto = require('crypto');

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
    ctx.type = mime.getType(path);
    response.set('pragma', 'no-cache');

    const ifNoneMatch = request.headers['if-none-match'];
    const imagePath = Path.resolve(__dirname, `.${path}`);
    const hash = crypto.createHash('md5');
    const imageBuffer = await fs.readFile(imagePath);
    hash.update(imageBuffer);
    const etag = `"${hash.digest('hex')}"`;
    if (ifNoneMatch === etag) {
        response.status = 304;
    } else {
        response.set('etag', etag);
        ctx.body = imageBuffer;
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
