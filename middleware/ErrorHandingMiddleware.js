const fs = require('fs');
const path = require('path');

const ApiError = require('../error/ApiError');

module.exports = function (err, req, res, next) {
    fs.appendFileSync(path.join(__dirname, '..', 'error.log'), `${new Date().toISOString()} - ${err.message}\n`);

    if (err instanceof ApiError) {
        return res.status(err.status).json({message: err.message})
    }
    return res.status(500).json({message: err.message})
}