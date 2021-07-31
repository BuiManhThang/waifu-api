const express = require('express');
const router = express.Router();
const animeController = require('../controllers/animeController');

router.get('/list', animeController.anime_list);

router.get('/:id', animeController.anime_detail);

module.exports = router;