'use strict'
var _ = require('underscore')
var Wreck = require('wreck')
Wreck.agents.https.keepAlive = true
Wreck.agents.http.keepAlive = true

var errors = require('./errors')
var Client = require('./Client')

function createNeo4jClient (options) {
  return new Client(options)
}
_.extend(createNeo4jClient, errors)

module.exports = createNeo4jClient
