const pm2 = require('pm2');
const { promisify } = require('util');

const connect = promisify(pm2.connect.bind(pm2));
const start = promisify(pm2.start.bind(pm2));
const list = promisify(pm2.list.bind(pm2));

connect()
    .then(() => start('server/server.js'))
    .then(() => list())
    .then((list) => {
        console.log(list);
        pm2.disconnect();
    } )
    .catch((err) => {
        console.log(err);
        pm2.disconnect();
    } )

