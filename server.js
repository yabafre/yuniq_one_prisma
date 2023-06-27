const express = require('express')
require('dotenv').config()
const port = process.env.VITE_APP_PORT || 3000
const fs = require('fs')
const compression = require('compression')
const cors = require('cors')
const app = express()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bodyParser = require('body-parser')
const io = require('@pm2/io')
const https = require('https')

// const sslOptions = {
//     key: fs.readFileSync('./server/localhost-key.pem'),
//     cert: fs.readFileSync('./server/localhost.pem')
// }

app.use(compression())
// app.use(cors({
//     origin: ["https://yuniq-back.onrender.com", "https://yuniq.fr", "http://localhost:3066", "http://localhost:5173"],
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true
// }));
app.options('*', cors())
app.use(cors())
app.use(async (req, res, next) => {
    req.prisma = prisma;
    next();
});

const AuthRouter = require ('./router/AuthRouter').router
const AdminRouter = require('./router/AdminRouter').router
const StoreRouter = require ('./router/StoreRouter').router
const ProfileRouter = require ('./router/ProfileRouter').router

app.use(bodyParser.json())
// app.use('/api', (req, res) => {
//     res.send('Hello to Yuniq store Api !')
// })
io.init({
    transactions: true,
    http: true,
});

app.use('/api/auth', AuthRouter)
app.use('/api/admin', AdminRouter)
app.use('/api/profile', ProfileRouter)
app.use('/api/store', StoreRouter)


prisma.$connect()
    .then(
        () => console.log('Prisma connected to database !'))
    .catch((err) => console.log(err))
app.listen(port, '0.0.0.0',() => {
    console.log(`Server running on port ${port}`);
});
// https.createServer(sslOptions, app).listen(port, () => {
//     console.log(`Server running on port ${port}`)
// }).on('error', (err) => {
//     console.log(err)
// })


// function startServer() {
//     const server = app.listen(port, () => {
//         console.log(`Server running on port ${port}`);
//     });
//
//     server.on("error", (err) => {
//         console.log(err);
//         console.log("Restarting server in 3 seconds...");
//         setTimeout(() => {
//             startServer();
//         }, 3000);
//     } );
// }
//
// startServer();
//
// // restart the server if nodemon crash
// process.on("unhandledRejection", (err) => {
//     console.log(err);
//     console.log("Restarting server in 3 seconds...");
//     setTimeout(() => {
//         startServer();
//     }, 3000);
// });
