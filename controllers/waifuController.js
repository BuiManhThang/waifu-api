const Waifu = require('../models/waifu');
const User = require('../models/user');
const {body, validationResult} = require('express-validator');
const path = require('path');
const fs = require('fs');

exports.waifu_list = async function(req, res) {
    try {
        const waifu_list = await Waifu.find({}, 'name thumbnail birthday user');
        res.json(waifu_list);
    } catch(err) {
        res.status(400).json({message: `Something went wrong ${err}`});
    }
};

exports.waifu_detail = async function(req, res) {
    try {
        const [waifu, numberUser] = await Promise.all([
            Waifu.findById(req.params.id).populate('anime').populate('genre'),
            User.countDocuments({waifu: req.params.id})
        ]);
        res.json({waifu, like: numberUser});
    } catch(err) {
        res.status(400).json({message: `Something went wrong ${err}`});
    }
}

exports.waifu_create = [
    body('name').trim().isLength({min: 1}).withMessage('The name is empty'),
    body('birthday', 'Birthday is invalid').optional({checkFalsy: true}).isISO8601().toDate(),
    body('detail').trim().isLength({min: 1}).withMessage('The detail is empty'),

    async function(req, res) {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.json({errors: errors.array()});
        }
        try {
            const user = await User.findById(req.body.userId);
            if(user.role === 'user') {
                return res.status(400).json({message: "Don't have permission"});
            }
            const found_waifu = await Waifu.findOne({name: req.body.name});
            if(found_waifu) {
                return res.json({errors: [{param: 'name', msg: 'Waifu has been exist'}]});
            }
            const newWaifu = new Waifu({
                name: req.body.name,
                birthday: req.body.birthday,
                detail: req.body.detail,
                thumbnail: `http://localhost:3000/images/waifu_thumbnails/${req.file.filename}`,
                genre: req.body.genre.split(','),
                anime: req.body.anime
            });
            const theWaifu = await newWaifu.save();
            res.json(theWaifu);
        } catch(err) {
            res.status(400).json({message: err});
        }
    }
];

exports.waifu_delete = async function(req, res) {
    try {
        const user = await User.findById(req.body.userId);
        if(user.role === 'user') {
            return res.status(400).json({message: "Don't have permission"});
        }
        const theWaifu = await Waifu.findByIdAndDelete(req.body.waifuId);
        const pathOnServer = theWaifu.thumbnail.slice(theWaifu.thumbnail.indexOf('images'));
        const pathToPublic = __dirname.slice(0, __dirname.indexOf('controllers'));
        const thumbnailPath = path.join(pathToPublic, 'public', pathOnServer);
        await fs.unlinkSync(thumbnailPath);
        const waifu_list = await Waifu.find({}, 'name thumbnail birthday user');
        res.json(waifu_list);
    } catch(err) {
        res.status(400).json({message: err});
    }
}