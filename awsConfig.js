const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
    endpoint: 'https://s3.timeweb.com',
    s3ForcePathStyle: true
});

module.exports = s3;