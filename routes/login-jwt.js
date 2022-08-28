const jwt = require('jsonwebtoken');
const { UserModel } = require('../../cardad-db/cardadSchema');
const passport = require('passport');

// below will accept a request to login
exports.getAccessToken = (req,res, next) => {
        if(req.user === undefined) {
            return res.redirect(`/login?redirect=${req.url}`);
        } else {
        UserModel.findById(req.user._id).select({salt:1, _id:1}).exec().then(user => {
            var userSalt = user.salt;
            // generate the JWT token. this will be saved in localstorage
            const token = jwt.sign({userName : req.user.username, userId: user._Id}, userSalt );
            return res.status(200).json({
            status:"SUCCESS",
            token: token
            })
        })
         
        }
    }

exports.getAllUsers = (req, res, next) => {
    User.find().exec().then(response => {
        return res.status(200).json({
            status:"SUCCESS"
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
}