const Waifu = require('../models/waifu');

exports.search = async function(req, res) {
    try {
        const waifuList = await Waifu.find({name: {$regex: '.*' + req.query.waifu + '.*', $options: 'i'}}).limit(3);
        res.json(waifuList);
    } catch(err) {
        res.status(400).json({ message: `Something went wrong: ${err}`});
    }
}