const {Slider} = require('../models/models');
const uuid = require('uuid');
const ApiError = require('../error/ApiError');
const { createImgUtils } = require('../utils/createImgUtils');
const { changeRotateUtils } = require('../utils/changeRotateUtils');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
    endpoint: 'https://s3.timeweb.com',
    s3ForcePathStyle: true
})

class SliderController {
    async create(req, res, next) {
        try {
            const {img} = req.files
            let {rotate} = req.query
            rotate = parseInt(rotate, 10);

            const fileName = uuid.v4();
            
            let fileExtension;
            if (rotate > 0) {
                fileExtension = await createImgUtils(img, fileName, rotate);
            } else {
                fileExtension = await createImgUtils(img, fileName);
            }

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
            let {rotate} = req.query
            rotate = parseInt(rotate, 10);

            const prevSlider = await Slider.findOne({where: {id}})

            if (rotate > 0 && !req.files) {
                await changeRotateUtils(rotate, prevSlider)
            }

            if (req.files) {
                const params = {
                    Bucket: process.env.BUCKET,
                    Key: prevSlider.img,
                };

                await s3.deleteObject(params).promise();

                const {img} = req.files

                const fileName = uuid.v4();

                let fileExtension;
                if (rotate > 0) {
                    fileExtension = await createImgUtils(img, fileName, rotate);
                } else {
                    fileExtension = await createImgUtils(img, fileName);
                }

                const slider = await Slider.update({img: `${fileName}.${fileExtension}`}, {where: {id}})

                return res.json(slider)
            }

            return res.json(prevSlider)
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new SliderController()