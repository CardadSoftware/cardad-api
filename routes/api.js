var express = require('express');
var router = express.Router();

router.post('/vehicles', function (req, res, next) {
  var body = req.body;
  body.status = "Working";
  res.json(body);
});

module.exports = router;