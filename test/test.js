const assert = require('chai').assert;
var request = require("request")
var proxyquire = require('proxyquire')
var sleep = require('sleep')


var multer = require('multer')
var expressValidator = require('express-validator');

var kuroshiroStub = { };
var expressStub = require('express');
var fsStub = { };
var pathStub = { };
var googleAPIStub = { };


var desc_list = [["test1", "test1"], ["test2", "result2"], ["test3", "hello"], ["test4", "sintagma"]];

var iter = 0;

kuroshiroStub.init = function(fun) {
    fun()
}

kuroshiroStub.toHiragana = function(str) {
    console.log("STR: ");
    console.log(str);
    var desc_dict = {};
    for(i = 0; i < desc_list.length; i++){
        desc_dict[desc_list[i][0]] = desc_list[i][1];
    }
    console.log(desc_dict);
    return desc_dict[str];
}

fsStub.rename = function(str1, str2, fun) {
    return true;
}

fsStub.existsSync = function(file) {
    console.log("file0")
    console.log(file)
    switch(file) {
    case 'I dont exist':
        return false;
    default:
        return true;
    }
}

pathStub.resolve = function(file) {
    return file;
}


textDetection = function(path) {
    return new Promise(function(resolve, reject)
                       {
                           setTimeout(function() {resolve(
                               [
                                   {
                                       'textAnnotations' :
                                       [
                                           {
                                               'description': desc_list[iter][0],
                                               'boundingPoly':
                                               {
                                                   'vertices':"This is the bounding box"
                                               }
                                           }
                                       ]
                                   }
                               ]
                           )}, 1);
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
    it('testing if image format handled properly',
       function(){
           assert.equal(app.isImage(1, undefined), false);
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
               console.log(app.UserImage);
               assert.equal(app.UserImage.textPronunciation, desc_list[iter][1]);
               assert.equal(app.UserImage.textDetections, desc_list[iter][0]);
               done();}, 25);
       });
});


describe('translationUpload', function(){
    it('check if translationUpload correctly sets UserImage data in nominal case (only english words).',
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
               console.log(app.UserImage);               
               assert.equal(app.UserImage.textPronunciation, desc_list[iter][1]);
               assert.equal(app.UserImage.textDetections, desc_list[iter][0]);
               done();}, 25);
       });
});


describe('translationUpload', function(){
    it('check if translationUpload correctly sets UserImage data in nominal case (only english words).',
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
               console.log(app.UserImage);               
               assert.equal(app.UserImage.textPronunciation, desc_list[iter][1]);
               assert.equal(app.UserImage.textDetections, desc_list[iter][0]);
               done();}, 25);
       });
});

describe('translationUpload', function(){
    it('check if translationUpload correctly sets UserImage data in nominal case (only english words).',
       function(done){
           iter = 3;
           app.translationUpload({  
               validationErrors : (() => (false)),
               checkBody:
               ((str1, str2) => ({
                   isImage: ((a, b) => (true))})),
               image:'./upload/image.png',
               file:{path:"renamed", mimetype:'image/jpg'}}
                                 , 0, 0);
           setTimeout(function() {
               console.log(app.UserImage);               
               assert.equal(app.UserImage.textPronunciation, desc_list[iter][1]);
               assert.equal(app.UserImage.textDetections, desc_list[iter][0]);
               done();}, 25);
       });
});

