const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, required: true, maxLength: 50},
    email: {type: String, required: true},
    password: {type: String, required: true},
    avata: {type: String, default: 'http://localhost:3000/images/avata_default.png'},
    role: {type: String, default: 'user'},
    date: {type: Date, default: new Date()},
    waifu: [{type: Schema.Types.ObjectId, ref: 'Waifu'}]
})

module.exports = mongoose.model('User', userSchema);