const {Review} = require('../models/models');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const ApiError = require('../error/ApiError');

class ReviewController {
    async create(req, res, next) {
        try {
            const {img} = req.files
            let fileName = uuid.v4() + '.jpg'

            const review = await Review.create({img: fileName})
            img.mv(path.resolve(__dirname, '..', 'static', fileName))

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