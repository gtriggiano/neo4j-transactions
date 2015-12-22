var _ = require('underscore')
var Wreck = require('wreck')
var Promise = require('bluebird')
var EventEmitter = require('eventemitter3')
var util = require('util')

var errors = require('./errors')
var Transaction = require('./Transaction')

var defaultOptions = {
  url: 'http://localhost:7474',
  timeout: 5000,
  credentials: null,
  connectionAttempts: 30,
  parseResults: true
}

function provideTransaction () {
  var self = this
  var transaction = new Transaction(this.options)
  transaction.on('error', function (error) {
    self.emit('tx:error', error)
  })
  transaction.on('DatabaseUnavaliable', function (error) {
    self.emit('DatabaseUnavaliable')
    self.databaseAvaliable = Promise.reject(error)
    self.databaseAvaliable.catch(function () {})
  })
  transaction.on('DatabaseAvaliable', function () {
    self.emit('DatabaseAvaliable')
    self.databaseAvaliable = Promise.resolve()
  })
  return transaction
}

function Client (options) {
  this.options = _.extend({}, defaultOptions, options)
  this.options.connectionAttempts = parseInt(this.options.connectionAttempts, 10)
  if (!_.isNumber(this.options.connectionAttempts)) this.options.connectionAttempts = 30
  this.options.connectionAttempts = Math.abs(this.options.connectionAttempts)
  this.options.url = (this.options.url.lastIndexOf('/') === this.options.url.length - 1) ? this.options.url : this.options.url + '/'
  this.options.url = {
    base: this.options.url,
    data: this.options.url + 'db/data/',
    transaction: this.options.url + 'db/data/transaction',
    commit: this.options.url + 'db/data/transaction/commit'
  }
  this.options.headers = {
    'Accept': 'application/json; charset=UTF-8',
    'Content-Type': 'application/json'
  }
  if (this.options.credentials) {
    this.updateCredentials(this.options.credentials.username, this.options.credentials.password)
  }

  // Test connection to database
  this.testNeo4jAvaliability(false, this.options.connectionAttempts)

  _.extend(this, errors)
}

util.inherits(Client, EventEmitter)

_.extend(Client.prototype, {
  updateCredentials: function updateCredentials (username, password) {
    if (username && password) {
      this.options.headers.authorization = 'Basic ' + new Buffer(username + ':' + password).toString('base64')
    } else {
      delete this.options.headers.authorization
    }
    return this
  },
  testNeo4jAvaliability: function testNeo4jAvaliability (silence, timesToRepeat) {
    var self = this
    var callNumber = 0
    silence = Boolean(silence)
    if (!timesToRepeat) timesToRepeat = 0
    timesToRepeat = parseInt(timesToRepeat, 10)
    if (!_.isNumber(timesToRepeat)) throw new Error('Method .testNeo4jAvaliability([silence], [timesToRepeat]) expects `timesToRepeat` to be a Number')
    timesToRepeat = Math.abs(timesToRepeat)

    function callDB (resolve, reject) {
      callNumber++
      Wreck.get(self.options.url.data, {headers: self.options.headers, json: true}, function (err, response, payload) {
        if (err && err.code === 'ENOTFOUND') {
          var error = new errors.DatabaseUnavaliable('Database at ' + self.options.url.base + ' is unavaliable')
          if (!silence) {
            self.emit('error', error)
            self.emit('DatabaseUnavaliable')
            if (callNumber < timesToRepeat) {
              setPromise()
            }
          }
          return reject(error)
        }
        if (!silence) self.emit('DatabaseAvaliable')
        resolve()
      })
    }
    function setPromise () {
      var callTimeout = Math.pow(callNumber, 2) * 200
      self.databaseAvaliable = new Promise(function (resolve, reject) {
        if (callTimeout) {
          setTimeout(function () {
            callDB(resolve, reject)
          }, callTimeout)
        } else {
          callDB(resolve, reject)
        }
      })
      self.databaseAvaliable.catch(function () {})
      if (!silence) {
        self.emit('databaseAvaliabilityPromise', self.databaseAvaliable)
      }
    }
    setPromise()
    return this
  },
  transaction: provideTransaction,
  tx: provideTransaction
})

module.exports = Client
