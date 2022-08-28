var express = require('express');
var passport = require('passport');
var { UserModel} = require('../../cardad-db/cardadSchema');
var router = express.Router();
const {getAccessToken} = require('./login-jwt');

router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    UserModel.register(new UserModel({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user, redirect: req.query.redirect });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    if(req.query.redirect !== undefined){
        res.redirect(req.query.redirect);
    }
    else{
    res.redirect('/');
    }
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

router.get('/authorize/token', getAccessToken);

module.exports = router;