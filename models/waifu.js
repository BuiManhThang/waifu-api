const mongoose = require('mongoose');
const {DateTime} = require('luxon');
const Schema = mongoose.Schema;

const waifuSchema = new Schema({
    name: {type: String, required: true},
    birthday: {type: Date, required: true},
    thumbnail: {type: String, required: true},
    detail: {type: String, required: true},
    anime: {type: Schema.Types.ObjectId, required: true, ref: 'Anime'}
});

waifuSchema.virtual('url').get(() => {
    return `http://localhost/waifu/${this._id}`;
});

waifuSchema.virtual('birth_day_formatted').get(() => {
    return DateTime.fromJSDate(this.birth_day).toLocaleString();
});

module.exports = mongoose.model('Waifu', waifuSchema);