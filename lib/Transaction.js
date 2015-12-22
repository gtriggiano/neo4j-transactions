var _ = require('underscore')
var EventEmitter = require('eventemitter3')
var util = require('util')
var Promise = require('bluebird')
var Wreck = require('wreck')

var errors = require('./errors')

function Transaction (options) {
  this._parseResults = options.parseResults
  this._transactionEndpoint = options.url.transaction
  this._commitEndpoint = options.url.commit
  this._wreckOptions = {
    payload: '',
    json: 'force',
    headers: options.headers,
    timeout: options.timeout
  }
  _.extend(this, errors)
}

util.inherits(Transaction, EventEmitter)

function parsePayloadResults (payload) {
  return _.map(payload.results, function (result) {
    return _.map(result.data, function (datum) {
      return _.reduce(datum.row, function (ret, col, i) {
        ret[result.columns[i]] = col
        return ret
      }, {})
    })
  })
}

function executeTransaction (tx, statements, commit, outcome) {
  if (tx._committed || tx._rolledBack) { // Prevent execution on committed or rolledback transactions
    var error = tx._committed ? new errors.TransactionAlreadyCommitted() : new errors.TransactionIsRolledBack()
    tx.emit('error', error)
    switch (outcome.type) {
      case 'callback':
        outcome.callback(error)
        break
      case 'promise':
        outcome.reject(error)
        break
    }
    return
  }
  statements = _.map(statements, function (stmt) { return _.pick(stmt, ['statement', 'parameters']) })
  var payload = JSON.stringify({statements: statements})
  var url = commit ? tx._commitEndpoint : tx._transactionEndpoint
  Wreck.post(
    url,
    _.extend({}, tx._wreckOptions, {payload: payload}),
    function (err, response, payload) {
      var error
      if (err) {
        if (err.code === 'ENOTFOUND') {
          error = new errors.DatabaseUnavaliable('Database at ' + url + ' is unavaliable')
          tx.emit('error', error)
          tx.emit('DatabaseUnavaliable', error)
          err = error
        } else {
          tx.emit('error', err)
          tx.emit('DatabaseAvaliable')
        }
        switch (outcome.type) {
          case 'callback':
            outcome.callback(err)
            break
          case 'promise':
            outcome.reject(err)
            break
        }
        return
      }
      tx.emit('DatabaseAvaliable')

      if (response.statusCode === 401) {
        error = new errors.UnauthorizedAccess('Database at ' + url + ' didn\'t authorize access')
        tx.emit('error', error)
        tx.emit('UnauthorizedAccess')
        switch (outcome.type) {
          case 'callback':
            outcome.callback(error)
            break
          case 'promise':
            outcome.reject(error)
            break
        }
        return
      }

      error = payload.errors.length ? new errors.Neo4jTransactionErrors(payload.errors) : null
      var results = (!error && tx._parseResults)
                    ? parsePayloadResults(payload)
                    : payload.results

      if (response.headers.location) tx._transactionEndpoint = response.headers.location
      if (payload.commit) tx._commitEndpoint = payload.commit
      if (payload.transaction && payload.transaction.expires) tx._expirationDate = new Date(payload.transaction.expires)

      if (commit && !error) {
        tx._committed = true
      }

      if (error) {
        tx.emit('error', error)
      }

      switch (outcome.type) {
        case 'callback':
          error ? outcome.callback(error) : outcome.callback(null, results)
          break
        case 'promise':
          error ? outcome.reject(error) : outcome.resolve(results)
          break
      }
    }
  )
}

function rollbackTransaction (tx, outcome) {
  if (tx._committed || tx._rolledBack) { // Prevent execution on committed or rolledback transactions
    var error = tx._committed ? new errors.TransactionAlreadyCommitted() : new errors.TransactionIsRolledBack()
    tx.emit('error', error)
    switch (outcome.type) {
      case 'callback':
        outcome.callback(error)
        break
      case 'promise':
        outcome.reject(error)
        break
    }
    return
  }

  var url = tx._transactionEndpoint
  Wreck.delete(
    url,
    tx._wreckOptions,
    function (err, response, payload) {
      var error
      if (err) {
        if (err.code === 'ENOTFOUND') {
          error = new errors.DatabaseUnavaliable('Database at ' + url + ' is unavaliable')
          tx.emit('error', error)
          tx.emit('DatabaseUnavaliable')
          err = error
        } else {
          tx.emit('DatabaseAvaliable')
        }
        switch (outcome.type) {
          case 'callback':
            outcome.callback(err)
            break
          case 'promise':
            outcome.reject(err)
            break
        }
        return
      }
      tx.emit('DatabaseAvaliable')

      if (response.statusCode === 401) {
        error = new errors.UnauthorizedAccess('Database at ' + url + ' didn\'t authorize access')
        tx.emit('error', error)
        tx.emit('UnauthorizedAccess')
        switch (outcome.type) {
          case 'callback':
            outcome.callback(error)
            break
          case 'promise':
            outcome.reject(error)
            break
        }
        return
      }

      if (response.statusCode === 405) {
        error = new errors.TransactionInactive()
        tx.emit('error', error)
        switch (outcome.type) {
          case 'callback':
            outcome.callback(error)
            break
          case 'promise':
            outcome.reject(error)
            break
        }
        return
      }

      tx._rolledBack = true

      switch (outcome.type) {
        case 'callback':
          error ? outcome.callback(error) : outcome.callback()
          break
        case 'promise':
          error ? outcome.reject(error) : outcome.resolve()
          break
      }
    }
  )
}

function validateTransactOrCommitInput (methodName, statements, callback) {
  if (!_.isArray(statements)) throw new Error('Method .' + methodName + '(statements, [callback]) expects `statements` to be an array')
  if (!_.every(statements, function (stmt) {
    return _.isObject(stmt) && typeof stmt.statement === 'string' && (typeof stmt.parameters === 'undefined' || _.isObject(stmt.parameters))
  })) throw new Error('Method .' + methodName + '(statements, [callback]) expects `statements` to be an array of objects structured as:\n\t{\n\t  statement: String,\n\t  [parameters]: Object\n\t}')
  if (callback && typeof callback !== 'function') throw new Error('Method .' + methodName + '(statements, [callback]) expects `callback` to be a function')
}

function buildStatement (query, parameters, options) {
  if (_.isArray(query)) {
    if (!_.every(query, function (item) { return typeof item === 'string' })) throw new Error('Method .statement(query, [parameters]) expects `query` to be a string or an array of strings')
    query = query.join('\n')
  }
  if (typeof query !== 'string') throw new Error('Method .statement(query, [parameters]) expects `query` to be a string or an array of strings')
  if (parameters && !_.isObject(parameters)) throw new Error('Method .statement(query, [parameters]) expects `parameters` to be an object')
  parameters = parameters || {}
  return {
    statement: query,
    parameters: parameters
  }
}

_.extend(Transaction.prototype, {
  transact: function (statements, callback) {
    var self = this
    statements = statements || []
    validateTransactOrCommitInput('transact', statements, callback)

    if (!callback) {
      return new Promise(function (resolve, reject) {
        executeTransaction(self, statements, false, {type: 'promise', resolve: resolve, reject: reject})
      })
    }
    executeTransaction(self, statements, false, {type: 'callback', callback: callback})
  },
  commit: function (statements, callback) {
    var self = this
    statements = statements || []
    validateTransactOrCommitInput('commit', statements, callback)

    if (!callback) {
      return new Promise(function (resolve, reject) {
        executeTransaction(self, statements, true, {type: 'promise', resolve: resolve, reject: reject})
      })
    }
    executeTransaction(self, statements, true, {type: 'callback', callback: callback})
  },
  extend: function (callback) {
    if (callback && typeof callback !== 'function') throw new Error('Method .extend([callback]) expects `callback` to be a function')
    if (callback) return this.transact([], callback)
    return this.transact([])
  },
  rollback: function (callback) {
    var self = this
    if (callback && typeof callback !== 'function') throw new Error('Method .rollback([callback]) expects `callback` to be a function')

    if (!callback) {
      return new Promise(function (resolve, reject) {
        rollbackTransaction(self, {type: 'promise', resolve: resolve, reject: reject})
      })
    }
    rollbackTransaction(self, {type: 'callback', callback: callback})
  },
  statement: buildStatement,
  stmt: buildStatement
})

module.exports = Transaction
