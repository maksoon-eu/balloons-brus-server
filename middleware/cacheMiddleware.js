const NodeCache = require('node-cache')

const cache = new NodeCache()

module.exports = function(duration) {
    return function (req, res, next) {
        const key = req.originalUrl
        const cacheResponse = cache.get(key)
        const token = req.headers.authorization
        console.log(req.headers.authorization)
        if (!token) {
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
        }
    }
}