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
kuroshiro.init(() => {});

// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Creates a Google Vision API client
const googleAPI = new vision.ImageAnnotatorClient(); // for OCR
const PORT = process.env.PORT || 5000;

//Multer file upload
var upload = multer({ 
	dest: 'public/upload/',
	limits: { 				//limits is for file verification
		fieldNameSize: 255,
		fileSize: 5242880,
		files: 1,
	}})

//custom function for use with express validator
//checks the file-type of an upload
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

//middleware for express validator
app.use(expressValidator({
	customValidators: {
		isImage: isImage}}));

//this is an object to hold translation data
//pronunciation is an inaccurate name, should be readings
var UserImage = {
	filename:"image.png",
	textDetections:"",
	textPronunciation:"",
	textDetectionsList:[],
	textPronunciationList:[]
}	
var errors = null;
var boundingBoxes = new Array();


function renderData(req, res) {
	console.log('Sending data back');
	console.log(UserImage.filename);
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
		return undefined;
	}
}

//send the image back over to the ejs file for display
function sendToUpload(req, res) {
	res.sendFile(resolvePath('./upload/' + UserImage.filename));
}

//checks characters for being kanji or not using unicode 
function isKanji(ch) {
    return (ch >= "\u4e00" && ch <= "\u9faf") ||
	(ch >= "\u3400" && ch <= "\u4dbf");
}

// process results from the Google OCR including text detected
// and each characters associated bounding vertexes
function readGoogle(results) {
	const detections = results[0].textAnnotations;
	
	//set bounding boxes for image, and set individual text detections for highlighting
	boundingBoxes = new Array();
	var detectionsKanji = "";
	var translation = "";
	
	UserImage.textDetectionsList = new Array();
	UserImage.textPronunciationList = new Array();
	
	//start at 1, since index 0 is the box/detection for the entire image
	for (i = 1; i < detections.length; i++) {
		
		var str = detections[i]['description'];
		var hasKanji = false;
		for (var j = 0; j < str.length; j++) {
			var ch = str.charAt(j);
			if ( (ch >= "\u4e00" && ch <= "\u9faf") || (ch >= "\u3400" && ch <= "\u4dbf") ){
				hasKanji = true;
				break;
			}
		}
		
		if (hasKanji) {
			
			var box = detections[i]['boundingPoly']['vertices'];
			boundingBoxes.push(box);

			detectionsKanji += detections[i]['description'];
			UserImage.textDetectionsList.push(detections[i]['description']);
			var kuro = kuroshiro.toHiragana(detections[i]['description']);
			UserImage.textPronunciationList.push(kuro);
			translation += kuro;
		}
		
	}
	
	
	UserImage.textPronunciation = translation;
	
	//detections without non-kanji characters
	UserImage.textDetections =  detectionsKanji;
}

//another part of the image validation
function isValidImageBody(req, res) {
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

// If valid image uploaded rename and pass it along for processing
function translationUpload(req, res, next) {
	if(isValidImageBody(req, res)){ 			
		// req.files is array of `photos` files 
		errors = null; //resets errors variable to remove error message
		
		//rename the file
		var tempPath = req.file.path;
		var targetPath = req.file.path+".png";
		UserImage.filename = "/upload/"+path.basename(targetPath);
		fs.renameSync(tempPath, targetPath);
		
		// Get Google API results and pass them along to be processed
		googleAPI.textDetection(targetPath).then(readGoogle);
		
		// remove redundant files 
		fs.readdir('upload', (err, files) => {
			if (files.length > 5) {
				for (i = 0; i < files.length / 2; i ++) {
					if (files[i] != UserImage.filename) {
						fs.unlink(".public/upload/" + files[i], (err) => {
						if (err) throw err;
						});		
					}
				}
				console.log('successfully deleted half of files');
			}
		});
		
		//this is crude but sets a 2 second timer for all processing to be done and then displays.
		//should have been done using callbacks but our modularity made it difficult
		setTimeout(function() {
		    res.render('pages/index', {
				UserImage: UserImage,
				errors: errors,
				boundingBoxes: boundingBoxes
			})
		}, 2000);
	}
}

app.post('/translate', upload.single('image'), translationUpload);
app.get('/', renderData);
app.get('/'+UserImage.filename, sendToUpload);

//nodes default error handling middleware
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

//listen on our specified port
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

//export functions for testing
exports.isImage = isImage
exports.renderData = renderData
exports.resolvePath = resolvePath
exports.sendToUpload = sendToUpload
exports.readGoogle = readGoogle
exports.translationUpload = translationUpload
exports.isValidImageBody = isValidImageBody
exports.UserImage = UserImage
