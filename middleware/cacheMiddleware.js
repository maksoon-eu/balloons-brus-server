const NodeCache = require('node-cache')
const jwt = require('jsonwebtoken')
const ApiError = require('../error/ApiError');

const cache = new NodeCache()

module.exports = function(duration) {
    return function (req, res, next) {
        const token = req.headers.authorization?.split(' ')[1]

            try {
                let decoded;
                if (token && token !== 'null') {
                    decoded = jwt.verify(token, process.env.SECRET_KEY);
                }

                if (!token || token === 'null' || decoded.role !== "ADMIN") {
                    const key = req.originalUrl
                    const cacheResponse = cache.get(key)

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
            } catch (e) {
                next(ApiError.badRequest(e.message))
            }
        
    }
}