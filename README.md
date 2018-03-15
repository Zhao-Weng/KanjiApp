# Kanji-App: Kanji Reading Assistance

This project was created for [Keith Stevens](https://github.com/fozziethebeat) during Paul Eggert's CS130 Software Engineering class at UCLA, during spring quarter 2018.

Kanji-App is a language conversion app that take in images of Japanese kanji and converts them into their subsequent hiragana so that they can be read and understood. This is similar to yomigana or furigana.

[Try Our App](https://infinite-taiga-51262.herokuapp.com)

## Key Features

* Automatic text detection
  - Our app will automatically detect the kanji in any uploaded image.
* Character Highlighting
  - Hover over an outlined character with your mouse to highlight its corresponding reading. 
* Phone Camera Support
  - Open our app on your phone to have it use your phones camera to upload images!
* Progressive Web App
  - Our app gets cached in your browser so you dont need to reload the whole page every time you open it.
* Test Cases
  - Comprehensive test cases to help with development.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

To clone and run this application locally, you'll need [Node.js](https://nodejs.org/en/download/)(which comes with [npm](http://npmjs.com)) installed on your computer.

You will also need to enable the Google cloud vision API. To do so complete the following steps:

* Go to the [projects page.](https://console.cloud.google.com/project)
* [Enable billing](https://support.google.com/cloud/answer/6293499#enable-billing) for your project. 
* Enable the [Google Cloud Vision API.](https://console.cloud.google.com/flows/enableapi?apiid=vision.googleapis.com)
* Set up authentication with a service account so you can access the API from your local workstation.
* Download API key in JSON format to the local project top directory, that is the same place where index.js is found.

#### From your command line:

```
# Clone this repository
$ git clone https://github.com/Zhao-Weng/KanjiApp

# Go into the repository
$ cd KanjiApp

# Install dependencies
$ npm install

# Enable Google Cloud vision by your setting environment variable. (https://cloud.google.com/docs/authentication/getting-started) 
  * Linux/Mac
      & export GOOGLE_APPLICATION_CREDENTIALS="[PATH]"
  * Windows Powershell
      & env:GOOGLE_APPLICATION_CREDENTIALS="[PATH]"

# Run the app
$ node index.js
```

Then navigate to http://localhost:5000/ on your favorite browser and use the app!

### Development

Due to the nature of our app further development requires the same setup as running it locally. Follow the above steps and you should be good to go.
Additionally you should know that due to our progressive web app design you need to modify some developer options in your browser to ease development.
Specifically options that will prevent caching of previous versions of the files so you can see changes. Read more [here.](https://developers.google.com/web/ilt/pwa/tools-for-pwa-developers)

## Testing

To check build correctness against unit tests, go to the test folder and
    run:

```
$ npm run test
```

To check test coverage, go to the KanjiApp (root) folder and run
    
```
$ istanbul cover --report html node_modules/.bin/_mocha -- -R spec
```

To view coverage data, open KanjiApp/coverage/index.html in your favorite browser.

## File Structure & How it Works

If you're wondering how our code is set up or how the app works this is the section for you.

### Technologies used

Our app has the following dependencies/ uses the following technologies:

* Node.js
  - Used as our javascript server framework  
* Express
  - Our web framework and file structure guid  
* Express validator
  - express middleware that allows us to preform file validation 
* EJS
  - A simple templating language that lets you generate HTML markup with plain JavaScript.
  - Replaces all of our .html files
* Multer
  - File upload middleware
* Google-cloud/vision
  - An OCR technology used to identify Japanese characters
* Kuroshiro
  - A Japanese language utility mainly for converting Kanji-mixed sentence to Hiragana, Katakana or Romaji

### Data Pipeline

Our app has a data pipeline structure with the following steps
1. A user selects an image and the upload button is clicked
2. The file is error checked (file-type/size)
3. OCR is run on the image by sending it to the Google-Cloud vision API.
4. Google-Cloud vision API results are processed. <br/>
	4.1 Detected text is stored in an array. <br/>
	4.2 Bounding boxes are saved in an array. <br/>
5. Detected Text is run through Kuroshiro to get Kanji readings.
6. Everything is sent over and rendered on a new version of the main page.

### Important files and folders

* /KanjApp
  + index.js (our main file, where most of our executable code is held)
  + key.json (should be your google-cloud-vision api key file)
  + /coverage
    - index.html (holds test results)
  + /test
    - test.js (hold all our test cases)
  + /views (provides templates which are rendered and served by your routes)
  + /pages
    - index.ejs (our main page, where everything that is displayed is held)
  + /public (contains all static files like images, styles and javascript)

for more information about our express file structure check [here.](https://www.terlici.com/2014/08/25/best-practices-express-structure.html)

## Shortcomings & Bugs

These are the things we did not do well enough, or problems we had with the libraries we used.
* Google OCR 
	- The Google OCR often has trouble identifying verticle characters that belong together.
	- The Google OCR has some inconsistency, it may misidentify or not identify some characters.
* Kuroshiro
	- Kuroshiro is our kanji to hiragana library, its accuracy is not 100% and it doesn't recognize some kanji.
* Delay
	- Due to the modularity required for testing it was difficult to implement callback for some processing functions.
	Instead we used a two second hard delay for processing to finish.
* Language Filtering
	- to filter Languages check the unicode of detected characters, that is anything outside of the unicode bracket of Japanese kanji is omitted.
	This can lead to legitimate kanji not being displayed
* Drag and Drop
	- Our drag and drop uses only the browsers native feature. A better drag and drop would have a dedicated area on the screen.
* Warnings
	- There should be more in depth warnings and feedback given to the user when bad images are input. The way we detect non-Japanese text made this difficult to implement in time.
		However the framework for displaying errors and warnings works great.
## Language Conversion

How to change our app to convert to a different language.

There several things that would need to be changed to change our app to output phonetic spelling in a different language.
 
 ### Things that DO NOT need to change.
1. Google Cloud Vision OCR.
	Google cloud can recognize tons of languages so no change needs to be made here.
2. Pipeline for passing data to the main page for display.
3. Image validation.
4. Layout and functionality of the web page, including bounding boxes, text highlighting, and hover events.


 ### Things that DO need to change.
1. Kuroshiro.
	You will need to use a different dictionary/library to convert detected words as Kuroshiro only handles Japanese.
2. Text filtering function.
	Our text filtering function (named "isKanji()") uses unicode checking.
	You will need to disable this or write a new function so that the new languages characters are not filtered out.
3. Display text. 
	The display text is not internationalized, that is is does not change depending the languages setting of your system. 
	The strings for things like "Readings", "Warning:...", and "Error:..." will have to be manually changed.


## Authors

* [Cody Hubbard](https://github.com/CSHubbard)
* [Eric Yuan](https://github.com/ericyuan96)
* [Nikola Samardzic](https://github.com/n-samar)
* [Weijia Yuan](https://github.com/ikyuu)
* [Xinyu Wang](https://github.com/klissancall)
* [Zhao Weng](https://github.com/Zhao-Weng)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

