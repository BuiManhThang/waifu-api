const Genre = require('../models/genre');
const Waifu = require('../models/waifu');

exports.genre_list = async function(req, res) {
    try {
        const genreList = await Genre.find();
        res.json(genreList);
    } catch(err) {
        res.status(400).json({message: `Something went wrong ${err}`});
    }
};

exports.genre_detail = async function(req, res) {
    try {
        const [genre, waifuList] = await Promise.all([
            Genre.findById(req.params.id),
            Waifu.find({genre: req.params.id}, 'name thumbnail')
        ])
        res.json({genre: genre, waifuList: waifuList});
    } catch(err) {
        res.status(400).json({message: `Something went wrong ${err}`});
    }
}