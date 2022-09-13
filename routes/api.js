const { VehicleModel, ChargeModel} = require('../../cardad-db/cardadSchema');

const assert = require('assert');

var express = require('express');
const { Model, default: mongoose } = require('mongoose');
var router = express.Router();

router.post('/vehicles/getVehicle', function (req, res, next) {
  var body = req.body;
  VehicleModel.find({name: new RegExp(body.name,'i')}).exec().then(results => res.json(results));
  
});

router.post('/vehicles/addVehicle', function (req, res, next) {
  VehicleModel.create(req.body).then(saved => res.json(saved));
  
});

router.post('/charge/getCharges', function (req, res, next){
  const { page, pageSize } = req.query;
  const limit = parseInt(pageSize || 30)
  const skip = parseInt(pageSize || 30) * ((parseInt(page) || 1) - 1)
  if(Array.isArray(req.body)){
    const objectIds = req.body.filter(it => it.id !== undefined).map(i => mongoose.Types.ObjectId(i.id));
    if(objectIds.length > 0) var filter = {'_id': { $in : objectIds }};
  }
  else{
    var filter = req.body;
  }
  const dateFilter = {createDate: {$lte: Date.now()} };
  filter = filter !== undefined ? {$and : [filter, dateFilter ]} : dateFilter;
  ChargeModel.find(filter).limit(limit)
    .skip(skip)
    .sort({ 'createDate': 1 })
    .then((docs) => 
    {
      res.json(docs);
    }).catch((err) => 
    {
      res.statusCode = 500;
      res.send(`<p>${err.message}</p>`);
    });
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