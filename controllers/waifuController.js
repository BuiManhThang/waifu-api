const Waifu = require('../models/waifu');

exports.waifu_list = async function(req, res) {
    try {
        const waifu_list = await Waifu.find({}, 'name thumbnail');
        res.json(waifu_list);
    } catch(err) {
        res.status(400).json({message: `Something went wrong ${err}`});
    }
};

exports.waifu_detail = async function(req, res) {
    try {
        const waifu = await Waifu.findById(req.params.id).populate('anime').populate('genre');
        res.json(waifu);
    } catch(err) {
        res.status(400).json({message: `Something went wrong ${err}`});
    }
}