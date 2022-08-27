const { VehicleModel } = require('../../cardad-db/cardadSchema');
const mongoose = require('mongoose');

//Set up default mongoose connection
const mongoDB = 'mongodb://127.0.0.1/cardad';

mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true, user: "crackpotmgee", pass: "rP&rs9g89qn7"});

var express = require('express');
var router = express.Router();

router.post('/vehicles', function (req, res, next) {
  var body = req.body;
  var result = VehicleModel.findOne({name: body.name});
  res.json(result);
});

module.exports = router;