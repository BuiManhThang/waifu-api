const express = require('express');
const router = express.Router();

const auth = require('./auth');
const genreController = require('../controllers/genreController');

router.get('/list', genreController.genre_list);

router.post('/create', auth.authorization, genreController.genre_create);

router.delete('/:id', auth.authorization, genreController.genre_delete);

router.put('/:id', auth.authorization, genreController.genre_update);

router.get('/:id', genreController.genre_detail);

module.exports = router;