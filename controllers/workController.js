const {Work} = require('../models/models');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const ApiError = require('../error/ApiError');

class WorkController {
    async create(req, res, next) {
        try {
            const {img} = req.files
            let fileName = uuid.v4() + '.jpg'

            const work = await Work.create({img: fileName})
            img.mv(path.resolve(__dirname, '..', 'static', fileName))

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