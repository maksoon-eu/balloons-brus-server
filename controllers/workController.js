const {Work} = require('../models/models')
const fs = require('fs');

class WorkController {
    async create(req, res) {
        const {name} = req.body
        const work = await Work.create({name})
        return res.json(work)
    }

    async getAll(req, res) {
        const works = await Work.findAll()
        return res.json(works)
    }

    async delete(req, res) {
        const {id} = req.body

        const prevWork = await Work.findOne({where: {id}})
        fs.unlinkSync(`${__dirname}/../static/${prevWork.img}`)

        const work = await Work.destroy({where: {id}})
        return res.json(work)
    }
}

module.exports = new WorkController()