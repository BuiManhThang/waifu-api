const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('./auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, `public/images/users`);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + path.extname(file.originalname));
    }
})

const upload = multer({storage: storage});

router.post('/register', userController.register);

router.get('/infor', auth.authorization, userController.infor);

router.get('/list', auth.authorization, userController.list);

router.post('/login', userController.login);

router.get('/logout', auth.authorization, userController.logout);

router.post('/delete', auth.authorization, userController.delete);

router.post('/update', auth.authorization, upload.single('avata'), userController.update);

router.post('/like', auth.authorization, userController.like);

module.exports = router;