const {Work} = require('../models/models');
const fs = require('fs');
const uuid = require('uuid');
const sharp = require('sharp');
const path = require('path');
const ApiError = require('../error/ApiError');
const heicConvert = require('heic-convert');

class WorkController {
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

            const work = await Work.create({img: `${fileName}.${fileExtension}`})

            return res.json(work)
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        let page = 1
        let limit = 8
        let offset = page * limit - limit

        const works = await Work.findAll({limit, offset})
        return res.json(works)
    }

    async delete(req, res) {
        const {id} = req.params

        const prevWork = await Work.findOne({where: {id}})
        fs.unlinkSync(`${__dirname}/../static/${prevWork.img}`)

        const work = await Work.destroy({where: {id}})
        return res.json(work)
    }
}

module.exports = new WorkController()