const {Review} = require('../models/models')
const fs = require('fs');

class ReviewController {
    async create(req, res) {
        const {name} = req.body
        const review = await Review.create({name})
        return res.json(review)
    }

    async getAll(req, res) {
        const reviews = await Review.findAll()
        return res.json(reviews)
    }

    async delete(req, res) {
        const {id} = req.body

        const prevReview = await Review.findOne({where: {id}})
        fs.unlinkSync(`${__dirname}/../static/${prevReview.img}`)

        const review = await Review.destroy({where: {id}})
        return res.json(review)
    }
}

module.exports = new ReviewController()