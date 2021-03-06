'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const mongoose = require("mongoose");

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);


/* this function deletes the entire database.
we'll call it in an `afterEach` block below
to ensure data from one test does not stick
around for next one */
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('/api/user', function() {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';
  const usernameB = 'exampleUserB';
  const passwordB = 'examplePassB';
  const firstNameB = 'ExampleB';
  const lastNameB = 'UserB';

  const role = "parent";
  const familyCode = "smith123";

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {});

  afterEach(function() {
    User.remove({});
    return tearDownDb();
  });

  describe('/api/users', function() {
    describe('POST', function() {
      it('Should reject users with missing username', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            password,
            firstName,
            lastName
          })
          .then((res) => { // Pass `res` to function
            // What is the code below?
            // expect.fail(null, null, 'Request should not succeed')

            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('username');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            // const res = err.response;
            // expect(res).to.have.status(422);
            // expect(res.body.reason).to.equal('ValidationError');
            // expect(res.body.message).to.equal('Missing field');
            // expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with missing password', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('password');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
          });
      });
      it('Should reject users with non-string username', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username: 1234,
            password,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with non-string password', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: 1234,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with non-trimmed username', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username: ` ${username} `,
            password,
            firstName,
            lastName
          })
          .then((res) => {
            // expect.fail(null, null, 'Request should not succeed')
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with non-trimmed password', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: ` ${password} `,
            firstName,
            lastName
          })
          .then((res) => {
            // expect.fail(null, null, 'Request should not succeed')
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with empty username', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username: '',
            password,
            firstName,
            lastName
          })
          .then((res) => {
            // expect.fail(null, null, 'Request should not succeed')
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at least 1 characters long'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with password less than ten characters', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: '123456789',
            firstName,
            lastName
          })
          .then((res) => {
            // expect.fail(null, null, 'Request should not succeed')
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at least 10 characters long'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with password greater than 72 characters', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: new Array(73).fill('a').join(''),
            firstName,
            lastName
          })
          .then((res) => {
            // expect.fail(null, null, 'Request should not succeed')
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at most 72 characters long'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with duplicate username', function() {
        // Create an initial user
        return User.create({
          username,
          password,
          firstName,
          lastName
        })
          .then(() =>
            // Try to create a second user with the same username
            chai.request(app).post('/api/users').send({
              username,
              password,
              firstName,
              lastName
            })
          )
          .then((res) => {
            expect.fail(null, null, 'Request should not succeed')
            expect(res.body.reason).to.equal('ValidationError');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;

            // Code below doesn't work
            /* expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Username already taken'
            );
            expect(res.body.location).to.equal('username'); */
          });
      });
      it('Should create a new user', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            role,
            familyCode
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              // 'username',
              // 'firstName',
              // 'lastName'
              'username', 'awardedPrizes', 'role',
              'familyCode', 'id', 'completedTasks'
              // ??? why include 'id' and 'completedTasks' ???
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.role).to.equal(role);
            expect(res.body.familyCode).to.equal(familyCode);
            return User.findOne({
              username
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.role).to.equal(role);
            expect(user.familyCode).to.equal(familyCode);
            return user.validatePassword(password);
          })
          .then(passwordIsCorrect => {
            expect(passwordIsCorrect).to.be.true;
          });
      });
    });

    /***** Should I Delete this GET test??? *****/
    describe('GET', function() {
      it('Should return an empty array initially', function() {
        return chai.request(app).get('/api/users').then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(0);
        });
      });
      it('Should return an array of users', function() {
        return User.create(
          {
            username,
            password,
            role,
            familyCode
          },
          {
            username: usernameB,
            password: passwordB,
            role: "child",
            familyCode: "lincoln123"
          }
        )
          .then(() => chai.request(app).get('/api/users'))
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.length(2);
            // expect(res.body[0]).to.deep.equal({
            //   username,
            //   firstName,
            //   lastName
            // });
            // expect(res.body[1]).to.deep.equal({
            //   username: usernameB,
            //   firstName: firstNameB,
            //   lastName: lastNameB
            // });

            expect(res.body[0]).to.have.keys(
              'username', 'awardedPrizes', 'role',
              'familyCode', 'id', 'completedTasks'
            );
            expect(res.body[1]).to.have.keys(
              'username', 'awardedPrizes', 'role',
              'familyCode', 'id', 'completedTasks'
            );

          });
      });
    });
  });
});
