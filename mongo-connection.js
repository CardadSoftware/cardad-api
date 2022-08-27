const mongoose = require('mongoose');

//Set up default mongoose connection
const mongoDB = 'mongodb://127.0.0.1/cardad';

mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true, user: "crackpotmgee", pass: "rP&rs9g89qn7"});


export default db;
