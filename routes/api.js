const { VehicleModel, ChargeModel} = require('../../cardad-db/cardadSchema');

var express = require('express');
var router = express.Router();

router.post('/vehicles/getVehicle', function (req, res, next) {
  var body = req.body;
  VehicleModel.find({name: new RegExp(body.name,'i')}).exec().then(results => res.json(results));
  
});

router.post('/vehicles/addVehicle', function (req, res, next) {
  VehicleModel.create(req.body).then(saved => res.json(saved));
  
});

router.post('/charge/createCharge', function (req, res, next)
{
  var newCharge = new ChargeModel(req.body);
  newCharge.validate().then((err) => 
  {
    if(err){
      res.statusCode = 400;
      res.json(err.message);
    }
    newCharge.save().then((saved) => res.json(saved)).catch((err) => 
    {
    res.statusCode = 400;
    res.json(err)
    });
  });
});

module.exports = router;