require('dotenv').config();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const express = require('express');
const sequelize = require('./db');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const router = require('./routes/index');
const errorHandler = require('./middleware/ErrorHandingMiddleware');
const path = require('path');
const fs = require('fs');
const https = require('https');

const PORT = process.env.PORT || 5001

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 1000,
	standardHeaders: 'draft-7',
	legacyHeaders: false
})

const options = {
    key: fs.readFileSync(path.resolve(__dirname,('sslcert/key.pem'))),
    cert: fs.readFileSync(path.resolve(__dirname,('sslcert/fullchain.pem')))
}

const app = express()
app.use(helmet());
app.use(limiter)
app.use(cors())
app.use(express.json())
app.use(fileUpload({}))
app.use('/api', router)

app.use(errorHandler)

const httpsServer = https.createServer(options, app);

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        httpsServer.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}


start()