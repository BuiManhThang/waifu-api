const Waifu = require('../models/waifu');
const User = require('../models/user');
const Genre = require('../models/genre');
const {body, validationResult} = require('express-validator');
const path = require('path');
const fs = require('fs');

exports.waifu_list = async function(req, res) {
    try {
        const waifu_list = await Waifu.find({});
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
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                if(req.file) {
                    const pathToPublic = __dirname.slice(0, __dirname.indexOf('controllers'));
                    const thumbnailPath = path.join(pathToPublic, 'public', 'images', 'waifu_thumbnails', req.file.filename);
                    console.log(thumbnailPath)
                    await fs.unlinkSync(thumbnailPath);
                }
                return res.json({errors: errors.array()});
            }
            console.log('hello')
            const user = await User.findById(req.body.userId);
            if(user.role === 'user') {
                if(req.file) {
                    const pathToPublic = __dirname.slice(0, __dirname.indexOf('controllers'));
                    const thumbnailPath = path.join(pathToPublic, 'public', 'images', 'waifu_thumbnails', req.file.filename);
                    await fs.unlinkSync(thumbnailPath);
                }
                return res.status(400).json({message: "Don't have permission"});
            }
            const found_waifu = await Waifu.findOne({name: req.body.name});
            if(found_waifu) {
                if(req.file) {
                    const pathToPublic = __dirname.slice(0, __dirname.indexOf('controllers'));
                    const thumbnailPath = path.join(pathToPublic, 'public', 'waifu_thumbnails', req.file.filename);
                    await fs.unlinkSync(thumbnailPath);
                }
                return res.json({errors: [{param: 'name', msg: 'Waifu has been exist'}]});
            }
            if(!req.file) {
                return res.json({errors: [{param: 'avata', msg: 'Thumbnail is empty'}]});
            }
            const newWaifu = new Waifu({
                name: req.body.name,
                birthday: req.body.birthday,
                detail: req.body.detail,
                thumbnail: `http://localhost:3000/images/waifu_thumbnails/${req.file.filename}`,
                genre: req.body.genre ? req.body.genre.split(',') : [],
                anime: req.body.anime
            });
            const theWaifu = await newWaifu.save();
            if(theWaifu.genre.length > 0) {
                await Genre.updateMany({_id: theWaifu.genre}, {$push: {waifu: theWaifu._id}});
            }
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
        await theWaifu.remove(); // use mindware
        if(theWaifu.genre.length > 0) {
            await Genre.updateMany({_id: theWaifu.genre}, {$pull: {waifu: theWaifu._id}});
        }
        const pathOnServer = theWaifu.thumbnail.slice(theWaifu.thumbnail.indexOf('images'));
        const pathToPublic = __dirname.slice(0, __dirname.indexOf('controllers'));
        const thumbnailPath = path.join(pathToPublic, 'public', pathOnServer);
        await fs.unlinkSync(thumbnailPath);
        const waifu_list = await Waifu.find({});
        res.json(waifu_list);
    } catch(err) {
        res.status(400).json({message: err});
    }
};

exports.waifu_update = [
    body('name').trim().isLength({min: 1}).withMessage('The name is empty'),
    body('birthday', 'Birthday is invalid').optional({checkFalsy: true}).isISO8601().toDate(),
    body('detail').trim().isLength({min: 1}).withMessage('The detail is empty'),

    async function(req, res) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                if(req.file) {
                    const pathToPublic = __dirname.slice(0, __dirname.indexOf('controllers'));
                    const thumbnailPath = path.join(pathToPublic, 'public', 'images', 'waifu_thumbnails', req.file.filename);
                    console.log(thumbnailPath)
                    await fs.unlinkSync(thumbnailPath);
                }
                return res.json({errors: errors.array()});
            }
            const user = await User.findById(req.body.userId);
            if(user.role === 'user') {
                if(req.file) {
                    const pathToPublic = __dirname.slice(0, __dirname.indexOf('controllers'));
                    const thumbnailPath = path.join(pathToPublic, 'public', 'images', 'waifu_thumbnails', req.file.filename);
                    console.log(thumbnailPath)
                    await fs.unlinkSync(thumbnailPath);
                }
                return res.status(400).json({message: "Don't have permission"});
            }
            const waifu = await Waifu.findById(req.body._id);
            const newWaifu = {
                _id: req.body._id,
                name: req.body.name,
                birthday: req.body.birthday,
                detail: req.body.detail,
                genre: req.body.genre ? req.body.genre.split(',') : [],
                anime: req.body.anime,
            };
            if(req.file) {
                const pathOnServer = waifu.thumbnail.slice(waifu.thumbnail.indexOf('images'));
                const pathToPublic = __dirname.slice(0, __dirname.indexOf('controllers'));
                const thumbnailPath = path.join(pathToPublic, 'public', pathOnServer);
                await fs.unlinkSync(thumbnailPath);
                newWaifu.thumbnail = `http://localhost:3000/images/waifu_thumbnails/${req.file.filename}`;
            }
            if(waifu.genre.length > 0) {
                await Genre.updateMany({_id: waifu.genre}, {$pull: {waifu: waifu._id}});
            }
            const theWaifu = await Waifu.findByIdAndUpdate(req.body._id, newWaifu);
            if(newWaifu.genre.length > 0) {
                await Genre.updateMany({_id: newWaifu.genre}, {$push: {waifu: newWaifu._id}});
            }
            res.json(theWaifu);
        } catch(err) {
            res.status(400).json({message: err});
        }
    }
];