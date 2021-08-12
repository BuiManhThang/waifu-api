const express = require('express');
const router = express.Router();
const waifuController = require('../controllers/waifuController');
const auth = require('./auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/images/waifu_thumbnails');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

router.get('/list', waifuController.waifu_list);

router.post('/create', upload.single('thumbnail'), auth.authorization, waifuController.waifu_create);

router.post('/delete', auth.authorization, waifuController.waifu_delete);

router.get('/:id', waifuController.waifu_detail);


module.exports = router;