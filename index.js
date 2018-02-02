const express = require('express');
const path = require('path');
var multer  = require('multer')
var upload = multer({ dest: 'upload/' })
const vision = require('@google-cloud/vision');
const kuroshiro = require("kuroshiro");


// Creates a Google Vision API client
const client = new vision.ImageAnnotatorClient(); // for OCR
const PORT = process.env.PORT || 5000;
var app =express();


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('pages/index'));


app.post('/translate', upload.single('image'), function (req, res, next) {
  // req.files is array of `photos` files 
  	var fileName = req.file['path'];
  	//console.log(fileName);
	client
	  .textDetection(fileName)
	  .then(results => {
	    const detections = results[0].textAnnotations;
	    var text = detections[0]['description'];
	    // console.log(text);
	    kuroshiro.init(function (err) {
		    // kuroshiro is ready
		    var result = kuroshiro.toHiragana(text);    
		    console.log(result);
		    res.status(200).send(result);
		});
	    // console.log(result);
	  })
	  .catch(err => {
	    console.error('ERROR:', err);
	  });
  	
  // req.body will contain the text fields, if there were any 
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));