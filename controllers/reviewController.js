const {Review} = require('../models/models');
const uuid = require('uuid');
const sharp = require('sharp');
const heicConvert = require('heic-convert');
const ApiError = require('../error/ApiError');
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

class ReviewController {
    async create(req, res, next) {
        try {
            const {img} = req.files

            const fileName = uuid.v4();
            
            const fileExtension = img.name.split('.').pop().toLowerCase();
            const allowedExtensions = ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'webp', 'heic'];

            if (!allowedExtensions.includes(fileExtension)) {
                throw new Error('Недопустимый формат изображения. Разрешены: jpg, jpeg, png, bmp, tiff, webp, heic.');
            }

            let imageBuffer;

            if (fileExtension === 'heic') {
                const { data } = await heicConvert({
                    buffer: img.data,
                    format: 'jpeg',
                    quality: 90,
                });
                imageBuffer = data;
                fileExtension = 'jpeg';
            } else {
                imageBuffer = await sharp(img.data)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toBuffer();
            }

            const imgS3 = await uploadImageToS3(imageBuffer, `${fileName}.${fileExtension}`);

            const review = await Review.create({img: `${fileName}.${fileExtension}`})

            return res.json(review)
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        let page = 1
        let limit = 8
        let offset = page * limit - limit

        const reviews = await Review.findAll({limit, offset})
        return res.json(reviews)
    }

    async delete(req, res) {
        const {id} = req.params

        const prevReview = await Review.findOne({where: {id}})

        const params = {
            Bucket: process.env.BUCKET,
            Key: prevReview.img,
        };

        try {
            await s3.deleteObject(params).promise();
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const review = await Review.destroy({where: {id}})
        return res.json(review)
    }
}

module.exports = new ReviewController()