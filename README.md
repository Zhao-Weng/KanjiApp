# Kanji App

Hi team AI-Network

!!!--IMPORTANT--!!!
COMMENTS ARE IMPORTANT, this isnt just a class project, Keith and the TA's will be evaluating our code. MAKE THEM HAPPY.
If you plan on doing some work on the app please keep in mind that you also have to have DETAILED COMMIT MESSAGES
Said commit messages must include WHO, WHAT, and WHY.
We will be graded off of these and we will need to generate a detailed change-log using them so please follow this rule.

This is the bare bones version of our app with some very basic functionality implemented courtesy of Zhao.

So far we are using Javascript, HTML, and CSS

The javascript dependecies we are currently using are using are 

    ejs": "^2.5.6",		--writing html in javascript
	
    express": "^4.15.2", 	--server stuff
    
    kuroshiro": "^0.2.1", 	--translation placeholder
    
    multer": "^1.3.0"  		--uploading files
	
If you have no idea whats going on at all watch this video at 2x speed 
https://www.youtube.com/watch?v=gnsO8-xJ8rs
It will explain Express which is what our server is using, as well as our server's general file structure (including how the HTML and CSS will work) 


*---------------------------------------------------------------------

The stuff below is not super important anymore as most of the Heroku stuff has been removed but you might find it useful still

*---------------------------------------------------------------------

A barebones Node.js app using [Express 4](http://expressjs.com/).

This application supports the [Getting Started with Node on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs) article - check it out.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

```sh
$ git clone git@github.com:heroku/node-js-getting-started.git # or clone your own fork
$ cd node-js-getting-started
$ npm install
$ export GOOGLE_APPLICATION_CREDENTIALS="./KanjiApp-d4369e186a32.json"
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

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

To view coverage data, open KanjiApp/coverage/index.html in your favourite
    browser.
## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)
