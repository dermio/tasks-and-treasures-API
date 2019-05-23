# Tasks and Treasures
[Tasks and Treasures](https://tasks-and-treasures-client.herokuapp.com/login)
is an app that keeps track of the tasks parents give their kids. Once
the parent approves all tasks are done, the child gets a prize. The app
tracks all prizes the child has earned.


### Requirements
This project requires [Node.js](https://nodejs.org/en/), [npm](https://www.npmjs.com/), and [MongoDB](https://www.mongodb.com/)

### Download
The user needs to download both client and server repositories.
```
$ git clone https://github.com/dermio/tasks-and-treasures-client.git
$ git clone https://github.com/dermio/tasks-and-treasures-API.git
```

### Configuration
#### Front End
Make sure the `REACT_APP_API_BASE_URL` variable is set appropriately
to point to your back end. By default, it should work without any
configuration if you run locally.

#### Back End
Set `DATABASE_URL` and `TEST_DATABASE_URL` environment variables to
MongoDB URL's for app and test databases. Make sure to set a `JWT_SECRET`
environment variable. Set an appropriate `CLIENT_ORIGIN` variable
if not running locally.

### Installation and Usage
The commands need to be run for both client and server repositories.
```
$ npm install
$ npm start
```

The app requires the creation of a user with the _**role**_ of **parent**,
and another user with the _**role**_ of **child**. Both users need to have
the same **family code**.

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

Because the interaction between parent and child users occurs with long polling,
the user may need to refresh the page when the other user changes
state on their end. For example, the parent clicks a button and the child
refreshes the page to see the updated state.


These situations require a page refresh to see the updated state:
* The child needs to refresh when the parent Finalizes the Task list
* The child needs to refresh when the parent Resets the Task List

These situations may need a page refresh:
* The parent needs to see the child notifies the parent tasks are done.
* The child needs to see the parent rejects tasks are done.
* The child needs to see the parent approves tasks are done and awards the prize.

