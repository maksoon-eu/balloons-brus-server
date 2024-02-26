const s3 = require('../awsConfig');
const { rotateUtils } = require('../utils/rotateUtils');

const changeRotateUtils = async (rotate, prevItem) => {
    if (rotate > 0) {
        const params = {
            Bucket: process.env.BUCKET,
            Key: prevItem.img,
        };

        const data = await s3.getObject(params).promise();

        const imageBuffer = data.Body;
        const rotatedImageBuffer = await rotateUtils(imageBuffer, rotate);

        await s3.deleteObject(params).promise();

        const uploadParams = {
            Bucket: process.env.BUCKET,
            Key: prevItem.img,
            Body: rotatedImageBuffer,
        };
    
        await s3.upload(uploadParams).promise();
    }
}

module.exports = { changeRotateUtils };