const mongoose = require('mongoose');
const {DateTime} = require('luxon');
const Schema = mongoose.Schema;

const waifuSchema = new Schema({
    name: {type: String, required: true},
    birthday: {type: Date, required: true},
    thumbnail: {type: String, required: true},
    detail: {type: String, required: true},
    anime: {type: Schema.Types.ObjectId, required: true, ref: 'Anime'},
    genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}],
    user: [{type: Schema.Types.ObjectId, ref: 'User'}]
});

waifuSchema.virtual('url').get(() => {
    return `http://localhost/waifu/${this._id}`;
});

waifuSchema.virtual('birth_day_formatted').get(() => {
    return DateTime.fromJSDate(this.birth_day).toLocaleString();
});

waifuSchema.pre('remove', function(next) {
    const waifu = this;
    waifu.model('User').update(
        { waifu: waifu._id }, 
        { $pull: { waifu: waifu._id } }, 
        { multi: true }, 
        next);
})

module.exports = mongoose.model('Waifu', waifuSchema);