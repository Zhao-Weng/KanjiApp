const express = require('express');
const sleep = require('sleep');
const path = require('path');
const vision = require('@google-cloud/vision');
const kuroshiro = require('kuroshiro');
var multer  = require('multer')
var expressValidator = require('express-validator');
var fs = require("fs");

// Creates Express App
var app = express();

//initialize kuroshiro
kuroshiro.init(() => {});//console.log("Kuroshiro ready"));

// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Creates a Google Vision API client
const googleAPI = new vision.ImageAnnotatorClient(); // for OCR
const PORT = process.env.PORT || 5000;

//Multer file upload
var upload = multer({ 
	dest: 'upload/',
	limits: { 				//limits is for file verification
		fieldNameSize: 255,
		fileSize: 5242880,
		files: 1,
	}})

// Makes errors a global variable so both multer
// and express-validator can access it.
// app.use(function(req, res, next){
//     app.locals.errors = null;
//     app.locals.boundingBoxes = new Array(); <-didnt work
//     next();
// });

//having these variables like this is pretty bad, how to fix?
//should add them to the UserImage struct!
var errors = null;
var boundingBoxes = new Array();

function isImage(value, mimetype){
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
    }
}

app.use(expressValidator({
	customValidators: {
		isImage: isImage}}));

//this is an object to hold translation data
var UserImage = {
	filename:"",
	textDetections:"",
	textPronunciation:"",
	textDetectionsList:[],
	textPronunciationList:[]
}	

function renderData(req, res) {
    res.render('pages/index', {
		UserImage: UserImage,
		errors: errors,
		boundingBoxes: boundingBoxes
	})
}


function resolvePath(pathStr) {
    if(fs.existsSync(pathStr)) {
        return path.resolve(pathStr);
    } else {
        //console.error('error');
        return undefined;
    }
}

function sendToUpload(req, res) {
	if(UserImage.filename){
		console.log('Sending file');
		console.log('%s',UserImage.filename);
		rres.render('pages/index', {
			imaa: UserImage.filename+".png"
		});
		console.log('Sending Done');
	}
	else{

	}
}

app.get('/', renderData);
app.get('/image.png', sendToUpload);

function readGoogle(results) {
	const detections = results[0].textAnnotations;
	UserImage.textDetections =  detections[0]['description'];
	
	//set bounding boxes for image, and set individual text detections for highlighting
	boundingBoxes = new Array();
	var translation = "";
	
	//start at 1, since index 0 is the box/detection for the entire image
	for (i = 1; i < detections.length; i++) {
		var box = detections[i]['boundingPoly']['vertices'];
		boundingBoxes.push(box);
		
		UserImage.textDetectionsList.push(detections[i]['description']);
		var kuro = kuroshiro.toHiragana(detections[i]['description']);
		UserImage.textPronunciationList.push(kuro);
		translation += kuro;
	}
	
	// note that the translation of the entire detection is not the same as the translations
	// for the individual detections added together
	// so translating the entire thing will not work with the highlighting feature
	// instead, we can translate each detection individually and add them together
	
	//Get pronunciation data from kuroshiro
	//UserImage.textPronunciation = kuroshiro.toHiragana(UserImage.textDetections);
	UserImage.textPronunciation = translation;
	console.log(`UserImage.textDetections: %s`,UserImage.textDetections);
	console.log(`UserImage.textPronunciation: %s`,UserImage.textPronunciation);	
}

function isValidImageBody(req, res) {
	//image validation
	req.checkBody('image', 'Please upload an image file').isImage(req.file.mimetype);
	var errors = req.validationErrors();
	if(errors) {
		res.render('pages/index', {
		    UserImage: UserImage,
		    boundingBoxes: boundingBoxes,
		    errors: errors});
        return false;
	}
    return true;
}

function translationUpload(req, res, next) {
		if(isValidImageBody(req, res)){
		// If valid image uploaded
		// req.files is array of `photos` files 
		errors = null; //resets errors variable to remove error message
		UserImage.filename = req.file.path;
		//console.log('%s',req.file['path']);
		
		//console.log('%s',req.file.path);
		//console.log('%s',req.file.path);

		var tempPath = req.file.path,
			targetPath = req.file.path.concat('.png');
		console.log('%s',targetPath);
		console.log('%s',req.file.path);
		//if (path.extname(req.file.name).toLowerCase() === '.png') {
		fs.rename(tempPath, targetPath, function(err) {
				//if (err) throw err;
				//console.log("Upload completed!");
		});
		console.log('Renaming Done');
		// Get Google API results
		googleAPI.textDetection(targetPath).then(readGoogle);
		//app.get(UserImage.filename.concat('.png'), sendToUpload);
		setTimeout(function() {
			res.redirect('/');
		}, 5000);
	// req.body will contain the text fields, if there were any 
	}
}

app.post('/translate', upload.single('image'), translationUpload);

//error handling middleware
app.use(function(err, req, res, next){
	if (err.message == 'Cannot read property \'mimetype\' of undefined') {
		errors = [{msg: "Please select a file"}];
	}
	else {
		errors = [{msg: err.message}];
	}
	if(errors) {
	res.render('pages/index', {
		UserImage: UserImage,
		boundingBoxes: boundingBoxes,
		errors: errors});
	return false;
	}
});	

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

exports.isImage = isImage
exports.renderData = renderData
exports.resolvePath = resolvePath
exports.sendToUpload = sendToUpload
exports.readGoogle = readGoogle
exports.translationUpload = translationUpload
exports.isValidImageBody = isValidImageBody
exports.UserImage = UserImage
