const Koa = require('koa');
const logger = require('koa-logger');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const chalk = require('chalk');

const server = new Koa();
const router = new Router();

router.get('/test/get', async (ctx, next) => {
    ctx.type = 'text/plain';
    ctx.body = `Test GET request success!
URL: ${ctx.url}
queryString: ${ctx.querystring}
headers: ${JSON.stringify(ctx.headers, null, 2)}    
`;
    await next();
});

router.get('/test/get/big_length', async (ctx, next) => {
    ctx.type = 'text/plain';
    ctx.body = 'lyreal666\n'.repeat(1024 * 1024);
    await next();
});

router.post('/test/post', async (ctx, next) => {
    ctx.body = `Test GET request success!
URL: ${ctx.url}
queryString: ${ctx.querystring}
headers: ${JSON.stringify(ctx.headers, null, 2)}
data: ${JSON.stringify(ctx.request.body, null, 2)}
`;
});

server.use(logger());
server.use(cors({
    exposeHeaders: ['Content-length'],
}));
server.use(bodyParser());
server.use(router.routes());

const PORT = 1027;
const HOST = 'localhost';
const serverURL = `http://${HOST}:${PORT}/`;
server.listen(PORT, HOST);
console.log(chalk.yellow('Server is running at:'), chalk.bold.underline.bgBlueBright.gray(serverURL));

process.addListener('unhandledRejection', (error) => {
    console.error(error);
});
