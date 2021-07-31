const express = require('express');
const router = express.Router();
const waifuController = require('../controllers/waifuController');

router.get('/list', waifuController.waifu_list);

router.get('/:id', waifuController.waifu_detail);

module.exports = router;