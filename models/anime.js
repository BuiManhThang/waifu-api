const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const animeSchema = new Schema({
    name: {type: String, required: true},
    release: {type: Date, required: true},
    eps: {type: Number, default: 0},
    mla: {type: Number, default: 0},
    thumbnail: {type: String, required: true}
});

module.exports = mongoose.model('Anime', animeSchema);