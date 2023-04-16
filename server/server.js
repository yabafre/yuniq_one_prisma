const express = require('express')
require('dotenv').config()
const port = process.env.PORT || 3000
const compression = require('compression')
const cors = require('cors')
const app = express()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bodyParser = require('body-parser')

app.use(compression())
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
app.use('/api/auth', AuthRouter)
app.use('/api/admin', AdminRouter)
app.use('/api/profile', ProfileRouter)
app.use('/api/store', StoreRouter)
prisma.$connect()
    .then(
        () => console.log('Prisma connected to database !'))
    .catch((err) => console.log(err))
app.listen(port, () => {
    console.log(`Server Express running at http://localhost:${port}`);
});
