const NodeCache = require('node-cache')
const jwt = require('jsonwebtoken')

const cache = new NodeCache()

module.exports = function(duration) {
    return function (req, res, next) {
        const key = req.originalUrl
        const cacheResponse = cache.get(key)
        const token = req.headers.authorization?.split(' ')[1]
        
        let decoded;
        if (token && token !== 'null') {
            decoded = jwt.verify(token, process.env.SECRET_KEY)
        }
        if (!decoded || decoded.role !== "ADMIN") {
            if (cacheResponse) {
                res.send(cacheResponse)
            } else {
                res.originalSend = res.send
                res.send = body => {
                    res.originalSend(body)
                    cache.set(key, body, duration)
                }
                next()
            }
        } else {
            next()
        }
    }
}