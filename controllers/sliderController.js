const {Slider} = require('../models/models');
const fs = require('fs');
const uuid = require('uuid');
const sharp = require('sharp');
const path = require('path');
const ApiError = require('../error/ApiError');
const heicConvert = require('heic-convert');

class SliderController {
    async create(req, res, next) {
        try {
            const {img} = req.files

            const fileName = uuid.v4();
            
            const fileExtension = img.name.split('.').pop().toLowerCase();
            const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'heic'];

            if (!allowedExtensions.includes(fileExtension)) {
                throw new Error('Недопустимый формат изображения. Разрешены: jpg, jpeg, png, gif, bmp, tiff, webp, heic.');
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

            const slider = await Slider.create({img: `${fileName}.${fileExtension}`})

            return res.json(slider)
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        const sliders = await Slider.findAll()
        return res.json(sliders)
    }

    async change(req, res, next) {
        try {
            const {id} = req.params

            const prevSlider = await Slider.findOne({where: {id}})

            fs.unlinkSync(`${__dirname}/../static/${prevSlider.img}`)
            const {img} = req.files
            
            const fileName = uuid.v4();
        
            let fileExtension = img.name.split('.').pop().toLowerCase();
            const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'heic'];

            if (!allowedExtensions.includes(fileExtension)) {
                throw new Error('Недопустимый формат изображения. Разрешены: jpg, jpeg, png, gif, bmp, tiff, webp, heic.');
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
                fileExtension = 'jpeg';
            }

            const slider = await Slider.update({img: `${fileName}.${fileExtension}`}, {where: {id}})
            
            fs.writeFileSync(path.resolve(__dirname, '..', 'static', `${fileName}.${fileExtension}`), imageBuffer);

            return res.json(slider)
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new SliderController()