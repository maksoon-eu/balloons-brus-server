require('dotenv').config()
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const express = require('express')
const sequelize = require('./db')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandingMiddleware')
const path = require('path')
// const fs = require('fs')
// const http = require('http')
// const https = require('https')
// const privateKey  = fs.readFileSync('sslcert/server.key', 'utf8')
// const certificate = fs.readFileSync('sslcert/server.crt', 'utf8')

const PORT = process.env.PORT || 5001

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	standardHeaders: 'draft-7',
	legacyHeaders: false
})

// const credentials = {key: privateKey, cert: certificate};

const app = express()
app.use(helmet());
app.use(limiter)
app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use('/api', router)

app.use(errorHandler)

// const httpServer = http.createServer(app);
// const httpsServer = https.createServer(credentials, app);

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        // httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`))
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}


start()