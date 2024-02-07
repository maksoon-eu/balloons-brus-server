const AWS = require('aws-sdk');
const { rotateUtils } = require('../utils/rotateUtils');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
    endpoint: 'https://s3.timeweb.com',
    s3ForcePathStyle: true
})

const changeRotateUtils = async (rotate, prevItem) => {
    if (rotate > 0) {
        const params = {
            Bucket: process.env.BUCKET,
            Key: prevItem.img,
        };

        const data = await s3.getObject(params).promise();
        
        await s3.deleteObject(params).promise();

        const imageBuffer = data.Body;
        const rotatedImageBuffer = await rotateUtils(imageBuffer, rotate);

        const uploadParams = {
            Bucket: process.env.BUCKET,
            Key: prevItem.img,
            Body: rotatedImageBuffer,
        };
    
        await s3.upload(uploadParams).promise();
    }
}

module.exports = { changeRotateUtils };