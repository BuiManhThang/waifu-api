const Anime = require('../models/anime');
const Waifu = require('../models/waifu');

exports.anime_list = async function(req, res) {
    try {
        const animeList = await Anime.find({}, 'name thumbnail mla');
        res.json(animeList);
    } catch(err) {
        res.status(400).json(`Something went wrong ${err}`);
    }
};

exports.anime_detail = async function(req, res) {
    try {
        const [anime, waifuList] = await Promise.all([
            Anime.findById(req.params.id),
            Waifu.find({anime: req.params.id})
        ]);
        res.json({anime: anime, waifuList: waifuList});
    } catch(err) {
        res.status(400).json(`Something went wrong ${err}`);
    }
}