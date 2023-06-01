const pm2 = require('pm2');
const { promisify } = require('util');

const connect = promisify(pm2.connect.bind(pm2));
const start = promisify(pm2.start.bind(pm2));
const list = promisify(pm2.list.bind(pm2));

connect()
    .then(() => start('ecosystem.config.js'))
    .then(() => list())
    .then(processes => {
        console.log(processes);
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
