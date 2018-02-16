const express = require('express');
const path = require('path');
const vision = require('@google-cloud/vision');
const kuroshiro = require("kuroshiro");
var multer  = require('multer')
var expressValidator = require('express-validator');
var fs = require("fs");

// Creates Express App
var app = express();

// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Creates a Google Vision API client
const client = new vision.ImageAnnotatorClient(); // for OCR
const PORT = process.env.PORT || 5000;

//Multer file upload
var upload = multer({ 
	dest: 'upload/',
    limits: { 				//limits is for file verification
      fieldNameSize: 255,
      fileSize: 5242880,
      files: 1,
    }})

	//Makes errors a global variable so both multer
	// and express-validator can access it.
app.use(function(req, res, next){
	app.locals.errors = null;
	app.locals.boundingBoxes = new Array();
	next();
});

//I think adding these to app.loacls makes this statement redundant
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

var UserImage = {
	filename:"placeholder text",
	textDetections:"placeholder text",
	textTranslation:"placeholder text"
}	//this is an object to hold translation data
	//the repeat statements below are to be there 
	//until i can make sure nothing breaks by using it only

app.get('/', (req, res) => res.render('pages/index', {
		UserImage: UserImage,
		errors: errors,
		boundingBoxes: boundingBoxes
	}));

app.get('/image.png', function (req, res) {
    res.sendfile(path.resolve('./upload/image.png'));
});

app.post('/translate', upload.single('image'), function (req, res, next) {
	//image validation
	req.checkBody('image', 'Please upload an image file').isImage(req.file.mimetype);
	
	var errors = req.validationErrors();
	if(errors) {
		res.render('pages/index', {
		UserImage: UserImage,
		boundingBoxes: boundingBoxes,
		errors: errors})
	} else {
		
		// req.files is array of `photos` files 
	  	var fileName = req.file['path'];
		UserImage.fileName = fileName;
		
		//bounding box code
		var tempPath = req.file.path,
	    targetPath = path.resolve('./upload/image.png');
		//if (path.extname(req.file.name).toLowerCase() === '.png') {
	        fs.rename(tempPath, targetPath, function(err) {
	            //if (err) throw err;
	            //console.log("Upload completed!");
	        });

		client
		  .textDetection(targetPath)
		  .then(results => {
		    const detections = results[0].textAnnotations;
		    var text = detections[0]['description'];
			UserImage.textDetections = text;

			//set bounding boxes for image
			boundingBoxes = new Array();
			for (i = 0; i < detections.length; i++) {
				var box = detections[i]['boundingPoly']['vertices'];
				boundingBoxes.push(box);
			}
			
			// kuroshiro is ready
		    kuroshiro.init(function (err) {
			    var result = kuroshiro.toHiragana(text);
				UserImage.textTranslation = result;		
			});
		  })
		  .catch(next());

		  setTimeout(function() {
	    	res.redirect('/');
			}, 2000);
	// req.body will contain the text fields, if there were any 
	 }
});

//Error Handling
app.use(function(err, req, res, next){
	res.render('pages/index', {
		UserImage: UserImage,
		errors: [{msg: err.message}],
		boundingBoxes: boundingBoxes
	});
	//console.log(errors);
	//res.status(400).send({error: err.message});
});	

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));