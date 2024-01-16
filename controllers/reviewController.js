const {Review} = require('../models/models');
const fs = require('fs');
const uuid = require('uuid');
const sharp = require('sharp11');
const path = require('path');
const heicConvert = require('heic-convert');
const ApiError = require('../error/ApiError');

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

            fs.writeFileSync(path.resolve(__dirname, '..', 'static', `${fileName}.${fileExtension}`), imageBuffer);

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
        fs.unlinkSync(`${__dirname}/../static/${prevReview.img}`)

        const review = await Review.destroy({where: {id}})
        return res.json(review)
    }
}

module.exports = new ReviewController()