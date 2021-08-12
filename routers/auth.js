const jwt = require('jsonwebtoken');

exports.authorization = async function(req, res, next) {
    try {
        if(!req.cookies.jwt) {
            return res.json({message: 'forbidden'});
        }
        const decoded = await jwt.verify(req.cookies.jwt, process.env.SECRET_JWT);
        req.body.userId = decoded.id;
        return next();
    } catch(err) {
        res.status(400).json({message: err})
    }
}