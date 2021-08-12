const User = require('../models/user');
const Waifu = require('../models/waifu');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const fs = require('fs');
const path = require('path')

exports.register = [
    body('email').trim().isLength({min: 1}).withMessage('Your email is empty').isEmail().withMessage('Your email is invalid'),
    body('password').trim().isLength({min: 6}).withMessage('Your password is less than 6 characters'),
    body('confirmPassword').trim().isLength({min: 6}).withMessage('Your password is less than 6 characters'),

    async function(req, res) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                return res.json({errors: errors.array()});
            }
            if(req.body.password !== req.body.confirmPassword) {
                return res.json({errors: [{param: 'confirmPassword', msg: 'Your password is not matched'}]});
            }
            const existUser = await User.findOne({email: req.body.email});
            if(existUser) {
                return res.json({errors: [{param: 'email', msg: 'The email has existed'}]});
            }
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(req.body.password, salt);

            const userName = req.body.email.split('@')[0];

            const user = new User({
                name: userName,
                email: req.body.email,
                password: hash
            })

            const theUser = await user.save();

            const token = await jwt.sign({id: theUser._id}, process.env.SECRET_JWT);
            res.cookie('jwt', token, {
                httpOnly: true
            })

            res.json({message: 'success'})

        } catch(err) {
            res.status(400).json({message: err})
        }
    }
]

exports.infor = async function(req, res) {
    try {
        const user = await User.findById(req.body.userId);
        const {password, ...infor} = user.toJSON();
        res.json(infor);
    } catch(err) {
        res.status(400).json({message: err})
    }
}

exports.login = async function(req, res) {
    try {
        const user = await User.findOne({email: req.body.email});
        if(!user) {
            return res.json({errors: [{param: 'email', msg: 'Email or password are wrong'}]});
        }
        if(! await bcrypt.compare(req.body.password, user.password)) {
            return res.json({errors: [{param: 'email', msg: 'Email or password are wrong'}]});
        }
        const token = await jwt.sign({id: user._id}, process.env.SECRET_JWT);
        res.cookie('jwt', token, {httpOnly: true});
        res.json({message: 'success'});
    } catch(err) {
        res.status(400).json({message: err})
    }
}

exports.logout = async function(req, res) {
    try {
        res.cookie('jwt', '', {
            httpOnly: true,
            maxAge: 0
        });
        res.json({message: 'success'});
    } catch(err) {
        res.status(400).json({message: err});
    }
}

exports.update = [
    body('name').trim().isLength({min: 1}).withMessage('Name is empty'),

    async function(req, res) {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.json({errors: errors.array()});
        }
        try {
            const user = await User.findById(req.body.userid);
            if(!user) {
                return res.json({message: 'User is not exist'});
            }
            const newUser = {
                _id: user._id,
                name: req.body.name,
                date: user.date,
                role: user.role,
                password: user.password,
                email: user.email
            };
            if(req.file === undefined) {
                newUser.avata = user.avata;
            } else {
                newUser.avata = `http://localhost:3000/images/users/${req.file.filename}`;
                if(user.avata.indexOf('users') > -1) {
                    const avatafile = path.join(__dirname.slice(0, __dirname.indexOf('controllers')), 'public', user.avata.slice(user.avata.indexOf('images')))
                    try {
                        fs.unlinkSync(avatafile);
                    } catch(e) {
                        console.log(e);
                    }
                }
            }
            const theUser = await User.findByIdAndUpdate(user._id, newUser);
            const {password, ...infor} = theUser.toJSON();
            res.json(infor);
        } catch(err) {
            res.status(400).json({message: err})
        }
    }
];

exports.like = async function(req, res) {
    try {
        const [user, waifu] = await Promise.all([
            User.findById(req.body.userId),
            Waifu.findById(req.body.waifuId)
        ]);

        if(!user) {
            return res.status(400).json({message: 'User not found'});
        }
        const index = user.waifu.indexOf(req.body.waifuId);
        const indexUser = waifu.user.indexOf(req.body.userId);
        console.log(indexUser)
        if(index > -1) {
            user.waifu.splice(index, 1);
            waifu.user.splice(indexUser, 1);
        } else {
            user.waifu.push(req.body.waifuId);
            waifu.user.push(req.body.userId);
        }
        console.log(indexUser)
        const [theUser, theWaifu] = await Promise.all([
            User.findByIdAndUpdate(req.body.userId, user, ''),  
            Waifu.findByIdAndUpdate(req.body.waifuId, waifu, '')  
        ]);
        res.json(theUser);
    } catch(err) {
        res.status(400).json({message: err})
    }
}