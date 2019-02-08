'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var dns = require('dns');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());
app.use(bodyParser.json())

// URL SCHEMA
var urlSchema = new mongoose.Schema({
      id: Number,
      url: String
  });
var urlModel = mongoose.model('URL', urlSchema);

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

//POST URL To Shorten 
app.post("/api/shorturl/new", function (req, res,next) {
  let originalUrl = req.body;
  let theData;
  
  let urlRegex = /https:\/\/www.|http:\/\/www./g;
  dns.lookup(req.body.url.replace(urlRegex,''), (err,address,family)=>{
  if(err){
    res.json({"error": err})
  }else{
  completeAction();
  }
  })
  // res.send('HELLo')
  
  function completeAction() {
  urlModel.find().exec()
    .then(docs => {
      theData = docs;
      var doc = new urlModel({"id":theData.length, "url": req.body.url});
      theData = theData.filter((obj) => obj["url"] === req.body.url)
      // check the url if it is already in DB
    if(theData.length === 0){
    doc.save()
      .then(result => {
      res.json(result)
      })
      .catch(err => {
      console.log(err)
      res.json({"error": err})
    })
    }else{
    res.json({"error": `URL ALREADY IN DATABASE as ${theData[0].id}`})
    }
  
  })
    .catch(err => {
    console.log(err)
      res.json({"error": err})
    })
  }
});

app.get('/api/shoturl', function (req, res,next) {
urlModel.find()
  .exec()
  .then(docs => {
  res.json(docs)
})
  .catch(err => {
      console.log(err)
      res.json({"error": err})
})
})

//shortcut URL
app.get('/api/shoturl/:short', function (req, res,next) {
console.log(req.params.short)
  let short = req.params.short
  urlModel.find({"id": short}).exec()
  .then(docs => {
  res.redirect(docs[0]["url"])
  })
  .catch(err => {
      console.log(err)
      res.json({"error": err})
})
})





app.listen(port, function () {
  console.log('Node.js listening ...');
});