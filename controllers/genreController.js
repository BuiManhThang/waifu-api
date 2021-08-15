const Genre = require('../models/genre');
const Waifu = require('../models/waifu');
const User = require('../models/user');
const {body, validationResult} = require('express-validator');

exports.genre_list = async function(req, res) {
    try {
        const genreList = await Genre.find().populate('waifu');
        res.json(genreList);
    } catch(err) {
        res.status(400).json({message: `Something went wrong ${err}`});
    }
};

exports.genre_detail = async function(req, res) {
    try {
        const [genre, waifuList] = await Promise.all([
            Genre.findById(req.params.id),
            Waifu.find({genre: req.params.id}, 'name thumbnail user birthday')
        ])
        res.json({genre: genre, waifuList: waifuList});
    } catch(err) {
        res.status(400).json({message: `Something went wrong ${err}`});
    }
}

exports.genre_create = [
    body('name').trim().isLength({min: 1}).withMessage('This field is required'),

    async function(req, res) {
        try {
            const user = await User.findById(req.body.userId);
            if(user.role !== 'admin') {
                return res.status(400).json({message: "Don't have permission"});
            }
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                return res.json({errors: errors.array()});
            }
            const newGenre = new Genre({
                name: req.body.name
            });
            const theGenre = await newGenre.save();
            res.json(theGenre);
        } catch(err) {
            res.status(400).json({message: `Something went wrong ${err}`});
        }
    }
];

exports.genre_delete = async function(req, res) {
    try {
        const user = await User.findById(req.body.userId);
        if(user.role !== 'admin') {
            return res.status(400).json({message: "Don't have permission"});
        }
        const deletedGenre = await Genre.findByIdAndDelete(req.params.id);
        if(deletedGenre.waifu.length > 0) {
            await Waifu.updateMany({_id: deletedGenre.waifu}, {$pull: {genre: deletedGenre._id}});
        }
        res.json(deletedGenre);
    } catch(err) {
        res.status(400).json({message: `Something went wrong ${err}`});
    }
};

exports.genre_update = [
    body('name').trim().isLength({min: 1}).withMessage('This field is required'),

    async function(req, res) {
        try {
            const user = await User.findById(req.body.userId);
            if(user.role !== 'admin') {
                return res.status(400).json({message: "Don't have permission"});
            }
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                return res.json({errors: errors.array()});
            }
            const genre = await Genre.findById(req.params.id);
            genre.name = req.body.name;
            await Genre.findByIdAndUpdate(req.params.id, genre);
            res.json(genre);
        } catch(err) {
            res.status(400).json({message: `Something went wrong ${err}`});
        }
    }
];

