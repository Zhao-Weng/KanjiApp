const assert = require('chai').assert;
var request = require("request")
var fs = require("fs")
var proxyquire = require('proxyquire')
var sleep = require('sleep')


var multer = require('multer')
var expressValidator = require('express-validator');

var kuroshiroStub = { };
var expressStub = require('express');
var fsStub = { };
var pathStub = { };
var googleAPIStub = { };

// description, translation, bbox_list triples
var desc_list = [
    ["test1", "test1", ["test1"]],
    ["家を建てる", "いえをたてる", ["家を建てる"]],
    ["月が輝いている", "つきがかがやいている", ["月", "が", "輝", "いている"]]];

// Kanji to hiragana
var kuro_dict = {
    "家を建てる":"いえをたてる",
    "test1":"test1",
    "test2":"result2",
    "test3":"hello",
    "test4":"sintagma",
    "月":"つき",
    "輝":"かがや",
    "が":"が",
    "いている":"いている"
};

var iter = 0;

kuroshiroStub.init = function(fun) {
    fun()
}

kuroshiroStub.toHiragana = function(str) {
    return kuro_dict[str];
}

fsStub.renameSync = function(str1, str2) {
    return true;
}

fsStub.existsSync = function(file) {
    switch(file) {
    case 'I dont exist':
        return false;
    default:
        return true;
    }
}

fsStub.readdir = function(folder, fun) {
    switch(folder) {
    case 'upload':
        fun(undefined, [1, 2, 3, 4, 5, 6]);
        fsStub.readdir = fs.readdir;
        assert.equal(unlink_count, 3);        
        break;
    default:
        return [];
    }
}

var unlink_count = 0;

fsStub.unlink = function(file, link) {
    unlink_count += 1;
}

describe('translationUpload', function(){
    it('Testing if redundant files are deleted',
       function(){
           iter = 0;
           result = app.translationUpload({  
               validationErrors : (() => (true)),
               checkBody:
               ((str1, str2) => ({
                   isImage: ((a, b) => (true))})),
               image:'./upload/image.png',
               file:{path:"renamed", mimetype:'image/jpg'}}
                                          , {render:((a, b) => true)}, 0);
       });
    
});



pathStub.resolve = function(file) {
    return file;
}

getResult = function(desc, bbox_desc_list) {
    result = [
        {
            'textAnnotations' :
            [
                {
                    'description': desc,
                    'boundingPoly':
                    {
                        'vertices':"This is the bounding box"
                    }
                }
            ]
        }
    ]
    // BOUNDING BOX DATA FROM HERE
    for (i = 0; i < bbox_desc_list.length; i++) {
        result[0].textAnnotations.push({
            'description': bbox_desc_list[i],
            'boundingPoly':
            {
                'vertices':"This is the bounding box"
            }});
    }
    return result
}

textDetection = function(path) {
    return new Promise(function(resolve, reject)
                       {
                           setTimeout(function() {resolve(getResult(desc_list[iter][0], desc_list[iter][2]))}, 1);
                       });
}


googleAPIStub.ImageAnnotatorClient = function() {
    this.textDetection = textDetection;
}



var app =  proxyquire('../index', {
    '@google-cloud/vision':googleAPIStub,
    'express':expressStub,
    'path':pathStub,
    'multer':multer,
    'kuroshiro':kuroshiroStub,
    'express-validator':expressValidator,
    'fs':fsStub
});

describe('App', function(){
    it('testing if I know how to test',
       function(){
           assert.equal(1+1, 2);
       });
});

describe('isImage', function(){
    it('testing if image format handled properly (undefined)',
       function(){
           assert.equal(app.isImage(1, undefined), false);
       });
});

describe('isImage', function(){
    it('testing if image format handled properly (image/jpg)',
       function(){
           assert.equal(app.isImage(1, "image/jpg"), true);
       });
});

describe('isImage', function(){
    it('testing if image format handled properly (image/jpeg)',
       function(){
           assert.equal(app.isImage(1, "image/jpeg"), true);
       });
});

describe('isImage', function(){
    it('testing if image format handled properly (image/png)',
       function(){
           assert.equal(app.isImage(1, "image/png"), true);
       });
});

describe('isImage', function(){
    it('testing if image format handled properly (junk)',
       function(){
           assert.equal(app.isImage(1, "junk"), false);
       });
});


describe('resolvePath', function(){
    it('check if undefined returned when file does not exist',
       function(){
           assert.equal(app.resolvePath('I dont exist'), undefined);
       });
});

describe('resolvePath', function(){
    it('check if successfuly resolved when file does exist',
       function(){
           assert.equal(app.resolvePath('./upload'),'./upload');
       });
});

describe('renderData', function(){
    it('check nominal behavior of renderData',
       function(){
           assert.equal(app.renderData(0, {render: ((a, b) => false)}), undefined);
       });
});

describe('sendToUpload', function(){
    it('check nominal behavior of sendToUpload',
       function(){
           assert.equal(app.sendToUpload(0, {sendFile: ((a) => false)}), undefined);
       });
});


describe('translationUpload', function(){
    it('check if translationUpload correctly handles non-image uploads',
       function(done){
           iter = 0;
           result = app.translationUpload({  
               validationErrors : (() => (true)),
               checkBody:
               ((str1, str2) => ({
                   isImage: ((a, b) => (true))})),
               image:'./upload/image.png',
               file:{path:"renamed", mimetype:'image/jpg'}}
                                          , {render:((a, b) => true)}, 0);
           setTimeout(function() {
               assert.equal(result, undefined);               
               done();}, 25);
       });
});



describe('translationUpload', function(){
    it('check if translationUpload correctly sets UserImage data in nominal case (only english words).',
       function(done){
           iter = 0;
           app.translationUpload({  
               validationErrors : (() => (false)),
               checkBody:
               ((str1, str2) => ({
                   isImage: ((a, b) => (true))})),
               image:'./upload/image.png',
               file:{path:"renamed", mimetype:'image/jpg'}}
                                 , 0, 0);
           setTimeout(function() {
               assert.equal(app.UserImage.textPronunciation, desc_list[iter][1]);
               assert.equal(app.UserImage.textDetections, desc_list[iter][0]);
               done();}, 25);
       });
});


describe('translationUpload', function(){
    it('check if translationUpload correctly sets UserImage data when there is only one detected box.',
       function(done){
           iter = 1;
           app.translationUpload({  
               validationErrors : (() => (false)),
               checkBody:
               ((str1, str2) => ({
                   isImage: ((a, b) => (true))})),
               image:'./upload/image.png',
               file:{path:"renamed", mimetype:'image/jpg'}}
                                 , 0, 0);
           setTimeout(function() {
               assert.equal(app.UserImage.textPronunciation, desc_list[iter][1]);
               assert.equal(app.UserImage.textDetections, desc_list[iter][0]);
               done();}, 25);
       });
});


describe('translationUpload', function(){
    it('check if translationUpload correctly sets UserImage data when using multiple boxes.',
       function(done){
           iter = 2;
           app.translationUpload({  
               validationErrors : (() => (false)),
               checkBody:
               ((str1, str2) => ({
                   isImage: ((a, b) => (true))})),
               image:'./upload/image.png',
               file:{path:"renamed", mimetype:'image/jpg'}}
                                 , 0, 0);
           setTimeout(function() {
               assert.equal(app.UserImage.textPronunciation, desc_list[iter][1]);
               assert.equal(app.UserImage.textDetections, desc_list[iter][0]);
               done();}, 25);
       });
});
