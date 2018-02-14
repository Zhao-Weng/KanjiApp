const express = require('express');
const path = require('path');
var multer  = require('multer')
var upload = multer({ 
	dest: 'upload/',
    limits: { 				//limits is for file verification
      fieldNameSize: 255,
      fileSize: 5242880,
      files: 1,
    }})
const vision = require('@google-cloud/vision');
const kuroshiro = require("kuroshiro");
var expressValidator = require('express-validator');


// Creates a Google Vision API client
const client = new vision.ImageAnnotatorClient(); // for OCR
const PORT = process.env.PORT || 5000;
var app = express();

app.use(expressValidator({
  customValidators: {
    isImage: function(value, mimetype) {
		if (mimetype == undefined)
			return false;
		switch (mimetype) {
			case 'image/jpg':
				return true;
			case 'image/jpeg':
                return true;
            case  'image/png':
                return true;
            default:
                return false;
}}}}));

var UserImage = {
	filename:"placeholder text",
	textDetections:"placeholder text",
	textTranslation:"placeholder text"
}	//this is an object to hold translation data
	//the repeat statements below are to be there 
	//until i can make sure nothing breaks by using it only
var boundingBoxes = new Array();


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('pages/index', {
		UserImage: UserImage
		boundingBoxes: boundingBoxes
	}));

app.post('/translate', upload.single('image'), function (req, res, next) {
  // req.files is array of `photos` files 
	req.checkBody('image', 'Please upload an image file').isImage(req.file.mimetype);
	
	var errors = req.validationErrors();
	if(errors) {
		res.render('pages/index', {
		UserImage: UserImage,
		errors: errors})
	} else {
	  	var fileName = req.file['path'];
		UserImage.fileName = fileName;
	  	//console.log(fileName);
		client
		  .textDetection(fileName)
		  .then(results => {
		    const detections = results[0].textAnnotations;
		    var text = detections[0]['description'];
			UserImage.textDetections = text;
		    console.log(text);
			//set bounding boxes for image
			boundingBoxes = new Array();
			for (i = 0; i < detections.length; i++) {
				var box = detections[i]['boundingPoly']['vertices'];
				boundingBoxes.push(box);
			}
		    kuroshiro.init(function (err) {
			    // kuroshiro is ready
			    var result = kuroshiro.toHiragana(text);
				UserImage.textTranslation = result;		
			    console.log(result);
			    //res.status(200).send(result);
			});
		    // console.log(result);
		  })
		  .catch(err => {
		    console.error('ERROR:', err);
		  });
	  // req.body will contain the text fields, if there were any 
	}
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));