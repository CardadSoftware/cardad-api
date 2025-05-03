const express = require('express');
const res = require('express/lib/response');
const { InvoiceModel } = require ('cardad-db')

const router = express.Router();

router.post('/', function (res, resp) {

    let newInvoice = res.body;
    InvoiceModel
 })

router.post('/upload', function (res, resp) {
    
});

router.get('/find', function (res, resp) { });

router.get('/file/find', function (res, resp) { });
