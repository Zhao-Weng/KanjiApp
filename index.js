const express = require('express');
const path = require('path');
const vision = require('@google-cloud/vision');
const kuroshiro = require("kuroshiro");
var multer  = require('multer');
var expressValidator = require('express-validator')

// Creates Express app
var app = express();

// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Creates a Google Vision API client
const client = new vision.ImageAnnotatorClient(); // for OCR
const PORT = process.env.PORT || 5000;

// Multer file upload 
var upload = multer({ 
	dest: 'upload/',
    limits: { 				//limits is for file verification
      fieldNameSize: 255,
      fileSize: 5242880,
      files: 1,
      fields: 1
    }})

	//express validator
app.use(function(req, res, next){
	res.locals.errors = null;
	next();
});

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
	
// Object to hold all image data
var UserImage = {
	filename:"placeholder text",
	textDetections:"placeholder text",
	textPronunciation:"placeholder text"
}	//this is an object to hold translation data
	//the repeat statements below are to be there 
	//until i can make sure nothing breaks by using it only

app.get('/', (req, res) => res.render('pages/index', {
		UserImage: UserImage
	}));

app.post('/translate', upload.single('image'), function (req, res, next) {
	// Image validation
	req.checkBody('image', 'Please upload an image file').isImage(req.file.mimetype);
	
	var errors = req.validationErrors();
	console.log(req.validationErrors());
	if(errors){
		res.render('pages/index', {
		UserImage: UserImage,
		errors: errors})
	} else {
		
	// req.files is array of `photos` files 
  	var fileName = req.file['path'];
	UserImage.fileName = fileName;

	client
	  .textDetection(fileName)
	  .then(results => {
	    const detections = results[0].textAnnotations;
	    var text = detections[0]['description'];
		UserImage.textDetections = text;
		
		// kuroshiro is ready
	    kuroshiro.init(function (err) {
		    var result = kuroshiro.toHiragana(text);
			UserImage.textPronunciation = result;		
		});
	  })
	  .catch(next);

  	res.redirect('/');
  // req.body will contain the text fields, if there were any 
	}
});

//Error Handeling
app.use(function(err, req, res, next){
	res.status(400).render('pages/index', {
		UserImage: UserImage,
		errors: [{msg: err.message}]
	});
	console.log(errors);
	//res.status(400).send({error: err.message});
});	

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));