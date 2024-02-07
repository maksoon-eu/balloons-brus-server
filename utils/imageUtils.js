const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
    endpoint: 'https://s3.timeweb.com',
    s3ForcePathStyle: true
})

const uploadImageToS3 = async (imageBuffer, fileName) => {
    const params = {
        Bucket: process.env.BUCKET,
        Key: fileName,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
    };

    const data = await s3.upload(params).promise();
    return data.Location;
};

module.exports = { uploadImageToS3 };
