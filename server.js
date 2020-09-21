'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const {Schema, Model} = mongoose;
var bodyParser = require('body-parser')

var cors = require('cors');

var app = express();

// create application/json parser
var jsonParser = bodyParser.json()
app.use(bodyParser.json({ type: 'application/*+json' }))
var shortid = require('shortid')
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology:true
});



app.use(cors({optionsSuccessStatus: true}));

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

const ShortURLSchema = mongoose.model('ShortURL', new Schema({
  short_url: String,
  original_url: String,
  suffix: String,
})
)
app.post('/api/shorturl/new/', urlencodedParser, function (req, res) {
  const clientReq = req.body.url;
  const suffix = shortid.generate()
  const newURL = new ShortURLSchema({
    "short_url": __dirname + "/api/shorturl/" + suffix,
    "original_url": req.body.url,
    "suffix": suffix
  }) ;

 newURL.save((err, newURL) => {
   if (err) return console.log(err);
   res.json ({
    "short_url": newURL.short_url,
    "original_url": newURL.original_url
   });
 });
});

app.get("/api/shorturl/:suffix", (req, res) => {
  const userShortLink = req.params.suffix;
  console.log(userShortLink, "<-userShortLink");
  ShortURLSchema.findOne({suffix: userShortLink},(err, shortURL) => {
    if(err) return console.log(err);
    console.log(shortURL.original_url, "<= original_url");
    res.redirect(shortURL.original_url);
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});