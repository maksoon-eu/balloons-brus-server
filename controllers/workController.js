const {Work} = require('../models/models');
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

class WorkController {
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

            const work = await Work.create({img: `${fileName}.${fileExtension}`})

            return res.json(work)
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        let page = 1
        let limit = 16
        let offset = page * limit - limit

        const works = await Work.findAll({limit, offset})
        return res.json(works)
    }

    async change(req, res, next) {
        try {
            const {id} = req.params
            let {rotate} = req.query
            rotate = parseInt(rotate, 10);

            const prevWork = await Work.findOne({where: {id}})

            if (rotate > 0 && !req.files) {
                await changeRotateUtils(rotate, prevWork)
            }

            if (req.files) {
                const params = {
                    Bucket: process.env.BUCKET,
                    Key: prevWork.img,
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

                const work = await Work.update({img: `${fileName}.${fileExtension}`}, {where: {id}})

                return res.json(work)
            }

            return res.json(prevWork)
        } catch(e) {
            console.log(e)
            next(ApiError.badRequest(e.message))
        }
    }

    async delete(req, res) {
        const {id} = req.params

        const prevWork = await Work.findOne({where: {id}})
        
        const params = {
            Bucket: process.env.BUCKET,
            Key: prevWork.img,
        };

        await s3.deleteObject(params).promise();

        const work = await Work.destroy({where: {id}})
        return res.json(work)
    }
}

module.exports = new WorkController()