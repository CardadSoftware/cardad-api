const { VehicleModel, db } = require('../../cardad-db/cardadSchema');

//Set up default mongoose connection
const mongoDB = 'mongodb://127.0.0.1:27017';

db.connect(mongoDB, { dbName:"cardad", useNewUrlParser: true, useUnifiedTopology: true, user: "cardadAPI", pass: "rP&7ZxRz63uEsPe1cq426R9"},(err) => {if(err){console.log("Enable to connect to DB: " + err.message + " stack: " + err.stack);} else{console.log("Connected to DB");}});

var express = require('express');
var router = express.Router();

router.post('/vehicles/getVehicle', function (req, res, next) {
  var body = req.body;
  VehicleModel.find({name: new RegExp(body.name,'i')}).exec().then(results => res.json(results));
  
});

router.post('/vehicles/addVehicle', function (req, res, next) {
  VehicleModel.create(req.body).then(saved => res.json(saved));
  
});

module.exports = router;