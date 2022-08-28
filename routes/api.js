const { VehicleModel} = require('../../cardad-db/cardadSchema');

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