const s3 = require('../awsConfig');

const uploadImageToS3 = async (imageBuffer, fileName) => {
    const params = {
        Bucket: process.env.BUCKET,
        Key: fileName,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
    };

    await s3.upload(params).promise();
};

module.exports = { uploadImageToS3 };
