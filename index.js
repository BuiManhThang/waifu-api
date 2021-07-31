const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

dotenv.config();

const port = process.env.PORT || 4000;
const app = express();

// routers

const waifuRouter = require('./routers/waifu');
const animeRouter = require('./routers/anime');
const genreRouter = require('./routers/genre');

// midleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded());
app.use(morgan('dev'));
app.use(cors({
    origin: 'http://localhost:8080',
    optionsSuccessStatus: 200
}))

mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log('Connect to mongoDB success!');
})
.catch((err) => {
    console.log('Err: ' + err);
})

app.use('/waifu', waifuRouter);
app.use('/anime', animeRouter);
app.use('/genre', genreRouter);

app.listen(port, () => {
    console.log('App is ready at port ' + port);
})