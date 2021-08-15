const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const genreSchema = new Schema({
    name: {type: String, required: true},
    waifu: [{type: Schema.Types.ObjectId, ref: 'Waifu'}]
});

module.exports = mongoose.model('Genre', genreSchema);