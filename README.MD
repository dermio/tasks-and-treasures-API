# Tasks and Treasures
[Tasks and Treasures](https://tasks-and-treasures-client.herokuapp.com/login)
is an app that keeps track of the tasks parents give their kids. Once
the parent approves all tasks are done, the child gets a prize. The app
tracks all prizes the child has earned.


### Requirements
This project requires [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/).

### Download
The user needs to download both client and server repositories.
```
$ git clone https://github.com/dermio/tasks-and-treasures-client.git
$ git clone https://github.com/dermio/tasks-and-treasures-API.git
```

### Installation and Usage
The commands need to be run for both client and server repositories.
```
$ npm install
$ npm start
```

### Built With
#### Front End
* React
* Redux
* React Router
* Redux Form
* React Joyride

#### Back End
* Node.js and npm
* Express.js
* MongoDB
* Passport
* JSON Web Token

#### Testing
##### Front End
* Enzyme
* Jest

##### Back End
* Mocha
* Chai

### Maintainers
[@dermio](https://github.com/dermio)

### License
This project is licensed under the terms of the ISC license.

### Issues
The interaction between parent and child users occurs via long polling.
Sometimes the parent and/or child user needs to refresh the page to see
the updated state from the server. Ideally, a stretch goal for the app
would implement the use of a web socket to have real time interaction
between parent and child users.


Mention concurrency?

