const express = require('express');
const path = require('path');
const vision = require('@google-cloud/vision');
const kuroshiro = require("kuroshiro");
var multer  = require('multer')
var expressValidator = require('express-validator');
var fs = require("fs");

// Creates Express App
var app = express();

//initialize kuroshiro 
kuroshiro.init();


// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Creates a Google Vision API client
const client = new vision.ImageAnnotatorClient(); // for OCR
const PORT = process.env.PORT || 5000;

//get multer to use in memory storage
var upload = multer({ storage: multer.memoryStorage(), limits: {fileSize: 1000 * 1000 * 12}});

//the file that the user uploads
var uploadedFile;


	//Makes errors a global variable so both multer
	// and express-validator can access it.
// app.use(function(req, res, next){
	// // app.locals.errors = null;
	// // app.locals.boundingBoxes = new Array(); <-didnt work
	// next();
// });

//having these variables like this is pretty bad, how to fix?
//should add them to the UserImage struct!
var errors = null;
var boundingBoxes = new Array();

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

//this is an object to hold translation data
var UserImage = {
	filename:"placeholder text",
	textDetections:"placeholder text",
	textPronunciation:"placeholder text"
}	

app.get('/', (req, res) => res.render('pages/index', {
		UserImage: UserImage,
		errors: errors,
		boundingBoxes: boundingBoxes
	}));


app.post('/translate', upload.single('image'), function (req, res, next) {
	//image validation
	req.checkBody('image', 'Please upload an image file').isImage(req.file.mimetype);
	
	var errors = req.validationErrors();
	if(errors) {
		res.render('pages/index', {
		UserImage: UserImage,
		boundingBoxes: boundingBoxes,
		errors: errors});
	} else {
		
		//save the uploaded file
		uploadedFile = req.file;
		console.log(uploadedFile);
		
		// req.files is array of `photos` files 
		UserImage.fileName = req.file['path'];
				
		client
		  .textDetection(req.file.buffer)	//do text detection on buffer contents of file upload
		  .then(results => {
			const detections = results[0].textAnnotations;
			UserImage.textDetections =  detections[0]['description'];

			//set bounding boxes for image
			boundingBoxes = new Array();
			for (i = 0; i < detections.length; i++) {
				var box = detections[i]['boundingPoly']['vertices'];
				boundingBoxes.push(box);
			}

			UserImage.textPronunciation = kuroshiro.toHiragana(UserImage.textDetections);		
		  })
			.catch(err => {
				console.error('ERROR:', err);
		});
		  setTimeout(function() {
			res.redirect('/');
			}, 2000);
	// req.body will contain the text fields, if there were any 
	 }
});

//Error Handling
// app.use(function(err, req, res, next){
	// res.render('pages/index', {
		// UserImage: UserImage,
		// errors: [{msg: err.message}],
		// boundingBoxes: boundingBoxes
	// });
// });	

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));