var express = require('express');
var router = express.Router();
var passport = require('passport');
// require mongodb user module
const { UserModel } = require('../../cardad-db/cardadSchema');

// require authentication via passport
router.use('/', passport.authenticate('passport-bearer'));
/* GET users listing. */
router.get('/me', function(req, res, next) {
  //var body = req.body;
  if(req.user === undefined){
    res("No User");
  }
  var userId = req.user._id;
  UserModel.findById(userId).exec()
  .then((user) => 
  {
    if(user === undefined){
      res("No User");
    }
    res(user);
  });

});

module.exports = router;
