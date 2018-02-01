const express = require('express');
const path = require('path');
var multer  = require('multer')
var upload = multer({ dest: 'upload/' })
//var translate = require('../translate');
const PORT = process.env.PORT || 5000;

var app =express();


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('pages/index'));


app.post('/translate', upload.single('image'), function (req, res, next) {
  // req.files is array of `photos` files 
  console.log(req.file);;
  // req.body will contain the text fields, if there were any 
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));