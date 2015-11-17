var EventEmitter = require('eventemitter3')
var sinon = require('sinon')
var should = require('should')
var Promise = require('bluebird')
require('should-sinon')
require('should-promised')

var errors = require('../lib/errors')
var Transaction = require('../lib/Transaction')

var transactionOptions = {
  parseResults: true,
  url: {
    transaction: 'http://localhost:7474/db/data/transaction',
    commit: 'http://localhost:7474/db/data/transaction/commit'
  },
  headers: {
    'Accept': 'application/json; charset=UTF-8',
    'Content-Type': 'application/json',
    'authorization': 'Basic ' + new Buffer('neo4j:test').toString('base64')
  },
  timeout: 5000
}

describe('Transaction instance', function () {
  it('should be an EventEmitter', function () {
    var tx = new Transaction(transactionOptions)
    tx.should.be.instanceOf(EventEmitter)
  })

  it('should expose the `DatabaseUnavaliable` error constructor', function () {
    var tx = new Transaction(transactionOptions)
    var databaseUnavaliableError = new tx.DatabaseUnavaliable()
    databaseUnavaliableError.should.be.instanceOf(Error)
  })
  it('should expose the `Neo4jTransactionErrors` error constructor', function () {
    var tx = new Transaction(transactionOptions)
    var neo4jTransactionErrorsError = new tx.Neo4jTransactionErrors()
    neo4jTransactionErrorsError.should.be.instanceOf(Error)
  })
  it('should expose the `UnauthorizedAccess` error constructor', function () {
    var tx = new Transaction(transactionOptions)
    var unauthorizedAccessError = new tx.UnauthorizedAccess()
    unauthorizedAccessError.should.be.instanceOf(Error)
  })
  it('should expose the `TransactionAlreadyCommitted` error constructor', function () {
    var tx = new Transaction(transactionOptions)
    var transactionAlreadyCommittedError = new tx.TransactionAlreadyCommitted()
    transactionAlreadyCommittedError.should.be.instanceOf(Error)
  })
  it('should expose the `TransactionIsRolledBack` error constructor', function () {
    var tx = new Transaction(transactionOptions)
    var transactionIsRolledBackError = new tx.TransactionIsRolledBack()
    transactionIsRolledBackError.should.be.instanceOf(Error)
  })
  it('should expose the `TransactionInactive` error constructor', function () {
    var tx = new Transaction(transactionOptions)
    var transactionInactiveError = new tx.TransactionInactive()
    transactionInactiveError.should.be.instanceOf(Error)
  })

  it('should emit a `DatabaseUnavaliable` event each time a (transact|commit|extend|rollback) method fails because of database unavaliability', function (done) {
    var tx = new Transaction(transactionOptions)
    tx._transactionEndpoint = 'http://not.exists'
    tx._commitEndpoint = 'http://not.exists'

    sinon.spy(tx, 'emit')
    tx.transact([])
      .catch(errors.DatabaseUnavaliable, function () {
        tx.emit.should.be.calledWith('DatabaseUnavaliable')
        tx.emit.restore()
        sinon.spy(tx, 'emit')
        return tx.commit()
      })
      .catch(errors.DatabaseUnavaliable, function () {
        tx.emit.should.be.calledWith('DatabaseUnavaliable')
        tx.emit.restore()
        sinon.spy(tx, 'emit')
        return tx.extend()
      })
      .catch(errors.DatabaseUnavaliable, function () {
        tx.emit.should.be.calledWith('DatabaseUnavaliable')
        tx.emit.restore()
        sinon.spy(tx, 'emit')
        return tx.rollback()
      })
      .catch(errors.DatabaseUnavaliable, function () {
        tx.emit.should.be.calledWith('DatabaseUnavaliable')
        tx.emit.restore()
      })
      .then(done)
      .catch(done)
  })
  it('should emit a `DatabaseAvaliable` event each time a (transact|commit|extend!rollback) method successfully comunicates with the database', function (done) {
    var tx = new Transaction(transactionOptions)
    sinon.spy(tx, 'emit')

    tx.transact([])
    .then(function () {
      tx.emit.should.be.calledWith('DatabaseAvaliable')
      tx.emit.restore()
      sinon.spy(tx, 'emit')
      return tx.extend()
    })
    .then(function () {
      tx.emit.should.be.calledWith('DatabaseAvaliable')
      tx.emit.restore()
      sinon.spy(tx, 'emit')
      return tx.rollback()
    })
    .then(function () {
      tx.emit.should.be.calledWith('DatabaseAvaliable')
      tx.emit.restore()

      var tx2 = new Transaction(transactionOptions)
      sinon.spy(tx2, 'emit')
      return tx2.commit([])
        .then(function () {
          tx2.emit.should.be.calledWith('DatabaseAvaliable')
          tx2.emit.restore()
        })
    })
    .then(function () {
      done()
    })
    .catch(done)
  })

  it('should emit a `error` event with a payload: (`Error: DatabaseUnavaliableError`) each time a (transact|commit|extend|rollback) method fails because of database unavaliability', function (done) {
    var tx = new Transaction(transactionOptions)
    tx._transactionEndpoint = 'http://not.exists'
    tx._commitEndpoint = 'http://not.exists'

    sinon.spy(tx, 'emit')
    tx.transact([])
      .catch(errors.DatabaseUnavaliable, function () {
        tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.DatabaseUnavaliable }))
        tx.emit.restore()
        sinon.spy(tx, 'emit')
        return tx.commit()
      })
      .catch(errors.DatabaseUnavaliable, function () {
        tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.DatabaseUnavaliable }))
        tx.emit.restore()
        sinon.spy(tx, 'emit')
        return tx.extend()
      })
      .catch(errors.DatabaseUnavaliable, function () {
        tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.DatabaseUnavaliable }))
        tx.emit.restore()
        sinon.spy(tx, 'emit')
        return tx.rollback()
      })
      .catch(errors.DatabaseUnavaliable, function () {
        tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.DatabaseUnavaliable }))
        tx.emit.restore()
      })
      .then(done)
      .catch(done)
  })
  it('should emit a `error` event with payload: (`Error: UnauthorizedAccessError`) each time a (transact|commit|extend) call fails because is unauthorized to access the database', function (done) {
    // Fixture: remove authorization headers
    var oldAuthorizationHeader = transactionOptions.headers.authorization
    delete transactionOptions.headers.authorization

    var tx = new Transaction(transactionOptions)
    sinon.spy(tx, 'emit')

    tx.transact([
      tx.stmt('MATCH (n) RETURN n')
    ])
    .then(function () { done(new Error('should emit a `error` event with payload: (Error: UnauthorizedAccess)')) })
    .catch(errors.UnauthorizedAccess, function () {
      tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.UnauthorizedAccess }))
      tx.emit.restore()
      sinon.spy(tx, 'emit')
      return tx.commit()
    })
    .catch(errors.UnauthorizedAccess, function () {
      tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.UnauthorizedAccess }))
      tx.emit.restore()
      sinon.spy(tx, 'emit')
      return tx.extend()
    })
    .catch(errors.UnauthorizedAccess, function () {
      tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.UnauthorizedAccess }))
      tx.emit.restore()
    })
    .then(function () {
      transactionOptions.headers.authorization = oldAuthorizationHeader
      done()
    })
    .catch(done)
  })
  it('should emit a `error` event with payload: (`Error: Neo4jTransactionErrors`) each time a (transact|commit) call produces any error by Neo4j', function (done) {
    var tx = new Transaction(transactionOptions)
    sinon.spy(tx, 'emit')
    tx.transact([
      tx.stmt('invalid syntax')
    ])
    .catch(errors.Neo4jTransactionErrors, function () {
      tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.Neo4jTransactionErrors }))
      tx.emit.restore()
      sinon.spy(tx, 'emit')
      return tx.commit([
        tx.stmt('invalid syntax')
      ])
    })
    .catch(errors.Neo4jTransactionErrors, function () {
      tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.Neo4jTransactionErrors }))
      tx.emit.restore()
    })
    .then(done)
    .catch(done)
  })
  it('should emit a `error` event with payload: (`Error: TransactionAlreadyCommitted`) when .(transact|commit|extend|rollback) is called and the transaction was previously committed', function (done) {
    var tx = new Transaction(transactionOptions)
    tx.commit([
      tx.stmt('MATCH (n) RETURN n')
    ])
    .then(function () {
      sinon.spy(tx, 'emit')
      return tx.transact()
    })
    .catch(errors.TransactionAlreadyCommitted, function () {
      tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.TransactionAlreadyCommitted }))
      tx.emit.restore()
      sinon.spy(tx, 'emit')
      return tx.commit()
    })
    .catch(errors.TransactionAlreadyCommitted, function () {
      tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.TransactionAlreadyCommitted }))
      tx.emit.restore()
      sinon.spy(tx, 'emit')
      return tx.extend()
    })
    .catch(errors.TransactionAlreadyCommitted, function () {
      tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.TransactionAlreadyCommitted }))
      tx.emit.restore()
      sinon.spy(tx, 'emit')
      return tx.rollback()
    })
    .catch(errors.TransactionAlreadyCommitted, function () {
      tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.TransactionAlreadyCommitted }))
      tx.emit.restore()
    })
    .then(done)
    .catch(done)
  })
  it('should emit a `error` event with payload: (`Error: TransactionIsRolledBack`) when .(transact|commit|extend|rollback) is called and the transaction was previously rolledback', function (done) {
    var tx = new Transaction(transactionOptions)
    tx.extend()
    .then(function () {
      return tx.rollback()
    })
    .then(function () {
      sinon.spy(tx, 'emit')
      return tx.transact()
    })
    .catch(errors.TransactionIsRolledBack, function () {
      tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.TransactionIsRolledBack }))
      tx.emit.restore()
      sinon.spy(tx, 'emit')
      return tx.commit()
    })
    .catch(errors.TransactionIsRolledBack, function () {
      tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.TransactionIsRolledBack }))
      tx.emit.restore()
      sinon.spy(tx, 'emit')
      return tx.extend()
    })
    .catch(errors.TransactionIsRolledBack, function () {
      tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.TransactionIsRolledBack }))
      tx.emit.restore()
      sinon.spy(tx, 'emit')
      return tx.rollback()
    })
    .catch(errors.TransactionIsRolledBack, function () {
      tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.TransactionIsRolledBack }))
      tx.emit.restore()
    })
    .then(done)
    .catch(done)
  })
  it('should emit a `error` event with payload: (`Error: TransactionInactive`) when .rollback() is called while the transaction IS NOT already active (aka: didn\'t complete a first .transact() or .extend() call)', function (done) {
    var tx = new Transaction(transactionOptions)
    sinon.spy(tx, 'emit')
    tx.rollback()
    .catch(errors.TransactionInactive, function () {
      tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.TransactionInactive }))
      tx.emit.restore()
    })
    .then(done)
    .catch(done)
  })

  describe('.statement(query, [parameters])', function () {
    it('should throw if `query` is not a string or an array of strings', function () {
      function callWithNumberQuery () {
        var tx = new Transaction(transactionOptions)
        tx.statement(42)
      }
      function callWithBadArrayQuery () {
        var tx = new Transaction(transactionOptions)
        tx.statement(['hello', 42])
      }
      ;(callWithNumberQuery).should.throw('Method .statement(query, [parameters]) expects `query` to be a string or an array of strings')
      ;(callWithBadArrayQuery).should.throw('Method .statement(query, [parameters]) expects `query` to be a string or an array of strings')
    })
    it('should throw if `parameters` is provided and is not an object', function () {
      function callWithBadParametersArgument () {
        var tx = new Transaction(transactionOptions)
        tx.statement('MATCH (n) RETURN n', 42)
      }
      (callWithBadParametersArgument).should.throw('Method .statement(query, [parameters]) expects `parameters` to be an object')
    })
    it('should return a valid statement object being passed a string as `query`', function () {
      var tx = new Transaction(transactionOptions)
      var parameters = {userId: 'xyz'}
      var statement = tx.statement('MATCH (n) RETURN n', parameters)
      statement.statement.should.be.a.String()
      statement.parameters.should.be.an.Object()
      statement.parameters.userId.should.equal(parameters.userId)
    })
    it('should return a valid statement object being passed an array of strings as `query`', function () {
      var tx = new Transaction(transactionOptions)
      var parameters = {userId: 'xyz'}
      var statement = tx.statement([
        'MATCH (n)',
        'RETURN n'
      ], parameters)
      statement.statement.should.be.a.String()
      statement.statement.should.equal('MATCH (n)\nRETURN n')
      statement.parameters.should.be.an.Object()
      statement.parameters.userId.should.equal(parameters.userId)
    })
  })

  describe('.stmt(query, [parameters])', function () {
    it('should be an alias of `.statement(query, [parameters])`', function () {
      var tx = new Transaction(transactionOptions)
      ;(tx.statement === tx.stmt).should.be.true()
    })
  })

  describe('.transact(statements, [callback])', function () {
    it('should throw if `statements` is not an array', function () {
      (function callWithBadFirstParameter () {
        var tx = new Transaction(transactionOptions)
        tx.transact('badparameter')
      }).should.throw('Method .transact(statements, [callback]) expects `statements` to be an array')
    })
    it('should throw if `statements` objects are not in the form of {statement: String, [parameters]: Object}', function () {
      function callWithBadStatements () {
        var tx = new Transaction(transactionOptions)
        tx.transact(['bad'])
      }
      function callWithBadStatementProp () {
        var tx = new Transaction(transactionOptions)
        tx.transact([{
          statement: 42
        }])
      }
      function callWithBadParametersProp () {
        var tx = new Transaction(transactionOptions)
        tx.transact([{
          statement: 'MATCH (n) RETURN n',
          parameters: 42
        }])
      }
      var errorMessage = 'Method .transact(statements, [callback]) expects `statements` to be an array of objects structured as:\n\t{\n\t  statement: String,\n\t  [parameters]: Object\n\t}'
      ;(callWithBadStatements).should.throw(errorMessage)
      ;(callWithBadStatementProp).should.throw(errorMessage)
      ;(callWithBadParametersProp).should.throw(errorMessage)
    })
    it('should throw if passed a truthy `callback` parameter which is not a functionn', function () {
      function callWithBadSecondParameter () {
        var tx = new Transaction(transactionOptions)
        tx.transact([], 'badparameter')
      }
      ;(callWithBadSecondParameter).should.throw('Method .transact(statements, [callback]) expects `callback` to be a function')
    })

    it('should return a promise if not passing a callback', function () {
      var tx = new Transaction(transactionOptions)
      tx.transact().should.be.a.Promise()
    })
    it('should **NOT** return a promise if passing a callback', function () {
      var tx = new Transaction(transactionOptions)
      should(tx.transact([], function () {})).not.be.a.Promise()
    })

    it('should update the transaction endpoint after the first call', function (done) {
      var tx = new Transaction(transactionOptions)
      var initialEndpoint = tx._transactionEndpoint
      tx.transact([])
      .then(function () {
        (initialEndpoint === tx._transactionEndpoint).should.be.false()
        return Promise.all([
          tx._transactionEndpoint,
          tx.transact([])
        ])
      })
      .spread(function (previousEndpoint) {
        (previousEndpoint === tx._transactionEndpoint).should.be.true()
      })
      .then(function () { done() })
      .catch(done)
    })
    it('should update transaction expiration date on every call', function (done) {
      var tx = new Transaction(transactionOptions)

      function fireTransaction () {
        return tx.transact([
          tx.stmt('MATCH (n) RETURN n')
        ])
      }

      fireTransaction()
      .then(function () {
        tx._expirationDate.should.be.instanceOf(Date)
        return Promise.all([
          tx._expirationDate,
          fireTransaction()
        ])
      })
      .spread(function (previousExpirationDate) {
        tx._expirationDate.should.be.instanceOf(Date)
        ;(tx._expirationDate === previousExpirationDate).should.be.false()
      })
      .then(function () { done() })
      .catch(done)
    })

    it('should reject promise with `DatabaseUnavaliable` error if database is not reachable', function (done) {
      var tx = new Transaction(transactionOptions)
      tx._transactionEndpoint = 'http://not.exists'
      tx.transact([])
      .then(function () { done(new Error('should reject with `DatabaseUnavaliable` error')) })
      .catch(errors.DatabaseUnavaliable, function () { done() })
      .catch(function () { done(new Error('should reject with `DatabaseUnavaliable` error')) })
    })
    it('should call callback with `DatabaseUnavaliable` error if database is not reachable', function (done) {
      var tx = new Transaction(transactionOptions)
      tx._transactionEndpoint = 'http://not.exists'
      tx.transact([], function (err, results) {
        err.should.be.a.instanceOf(errors.DatabaseUnavaliable)
        should(results).be.undefined()
        done()
      })
    })

    it('should reject promise with `Neo4jTransactionErrors` error if Neo4j response contains errors', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.transact([
        tx.stmt('invalid cypher syntax')
      ])
      .then(function () { done(new Error('should reject promise with `Neo4jErrors` error')) })
      .catch(errors.Neo4jTransactionErrors, function (e) {
        e.errors.should.containDeepOrdered([{code: 'Neo.ClientError.Statement.InvalidSyntax'}])
        done()
      })
      .catch(function () { done(new Error('should reject promise with `Neo4jErrors` error')) })
    })
    it('should call callback with `Neo4jTransactionErrors` error if Neo4j response contains errors', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.transact([
        tx.stmt('invalid cypher syntax')
      ], function (err, results) {
        err.should.be.instanceOf(errors.Neo4jTransactionErrors)
        err.errors.should.containDeepOrdered([{code: 'Neo.ClientError.Statement.InvalidSyntax'}])
        should(results).be.undefined()
        done()
      })
    })

    it('should reject promise with `TransactionAlreadyCommitted` error if transaction is already committed', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.commit([
        tx.stmt('CREATE (n:TestNode) SET n.name ="testContent" RETURN n')
      ])
      .then(function () {
        return tx.transact([
          tx.stmt('CREATE (n:TestNode) SET n.name ="testContent2" RETURN n')
        ])
      })
      .catch(errors.TransactionAlreadyCommitted, function () { done() })
      .catch(done)
    })
    it('should call callback with `TransactionAlreadyCommitted` error if transaction is already committed', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.commit([
        tx.stmt('CREATE (n:TestNode) SET n.name ="testContent" RETURN n')
      ], function (err, results) {
        if (err) return done(err)
        tx.transact([
          tx.stmt('CREATE (n:TestNode) SET n.name ="testContent2" RETURN n')
        ], function (err, results) {
          err.should.be.instanceOf(errors.TransactionAlreadyCommitted)
          should(results).be.undefined()
          done()
        })
      })
    })

    it('should reject promise with `TransactionIsRolledBack` error if transaction was previously rolled back', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.transact()
      .then(function () {
        return tx.rollback()
      })
      .then(function () {
        return tx.transact()
      })
      .then(function () { done(new Error('should reject with `TransactionIsRolledBack` error')) })
      .catch(errors.TransactionIsRolledBack, function () { done() })
      .catch(function () { done(new Error('should reject with `TransactionIsRolledBack` error')) })
    })
    it('should call callback with `TransactionIsRolledBack` error if transaction was previously rolled back', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.transact([], function (err, results) {
        if (err) return done(err)
        tx.rollback(function (err) {
          if (err) return done(err)
          tx.transact([], function (err) {
            err.should.be.instanceOf(errors.TransactionIsRolledBack)
            done()
          })
        })
      })
    })

    it('should reject promise with `UnauthorizedAccess` error if Neo4j response statusCode is 401', function (done) {
      // Fixture: remove authorization headers
      var oldAuthorizationHeader = transactionOptions.headers.authorization
      delete transactionOptions.headers.authorization

      var tx = new Transaction(transactionOptions)

      tx.transact([
        tx.stmt('MATCH (n) RETURN n')
      ])
      .then(function () { done(new Error('should reject promise with `UnauthorizedAccess`')) })
      .catch(errors.UnauthorizedAccess, function () {})
      .catch(done)
      .then(function () {
        transactionOptions.headers.authorization = oldAuthorizationHeader
        done()
      })
    })
    it('should call callback with `UnauthorizedAccess` error if Neo4j response statusCode is 401', function (done) {
      // Fixture: remove authorization headers
      var oldAuthorizationHeader = transactionOptions.headers.authorization
      delete transactionOptions.headers.authorization

      var tx = new Transaction(transactionOptions)

      tx.transact([
        tx.stmt('MATCH (n) RETURN n')
      ], function (err, results) {
        err.should.be.instanceOf(errors.UnauthorizedAccess)
        should(results).be.undefined()
        transactionOptions.headers.authorization = oldAuthorizationHeader
        done()
      })
    })

    it('results are parsed if `options.parseResult` is truthy', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.transact([
        tx.stmt('CREATE (n:TestNode) SET n.name = "transactParsesResults" RETURN n, LABELS(n)[0] as label')
      ])
      .then(function (results) {
        ;(results[0][0].n.name).should.equal('transactParsesResults')
        ;(results[0][0].label).should.equal('TestNode')
      })
      .then(function () { done() })
      .catch(done)
    })
    it('results are NOT parsed if `options.parseResult` is NOT truthy', function (done) {
      var newOptions = JSON.parse(JSON.stringify(transactionOptions))
      newOptions.parseResults = false
      var tx = new Transaction(newOptions)
      tx.transact([
        tx.stmt('CREATE (n:TestNode) SET n.name = "transactParsesResults" RETURN n, LABELS(n)[0] as label')
      ])
      .then(function (results) {
        results.length.should.equal(1)
        results[0].columns.length.should.equal(2)
        results[0].columns.should.containDeepOrdered(['n', 'label'])
        results[0].data.length.should.equal(1)
        results[0].data.should.containDeepOrdered([{row: [{name: 'transactParsesResults'}, 'TestNode']}])
      })
      .then(function () { done() })
      .catch(done)
    })
  })

  describe('.commit(statements, [callback])', function () {
    it('should throw if `statements` is not an array', function () {
      (function callWithBadFirstParameter () {
        var tx = new Transaction(transactionOptions)
        tx.commit('badparameter')
      }).should.throw('Method .commit(statements, [callback]) expects `statements` to be an array')
    })
    it('should throw if `statements` objects are not in the form of {statement: String, [parameters]: Object}', function () {
      function callWithBadStatements () {
        var tx = new Transaction(transactionOptions)
        tx.commit(['bad'])
      }
      function callWithBadStatementProp () {
        var tx = new Transaction(transactionOptions)
        tx.commit([{
          statement: 42
        }])
      }
      function callWithBadParametersProp () {
        var tx = new Transaction(transactionOptions)
        tx.commit([{
          statement: 'MATCH (n) RETURN n',
          parameters: 42
        }])
      }
      var errorMessage = 'Method .commit(statements, [callback]) expects `statements` to be an array of objects structured as:\n\t{\n\t  statement: String,\n\t  [parameters]: Object\n\t}'
      ;(callWithBadStatements).should.throw(errorMessage)
      ;(callWithBadStatementProp).should.throw(errorMessage)
      ;(callWithBadParametersProp).should.throw(errorMessage)
    })
    it('should throw if passed a truthy `callback` parameter which is not a function', function () {
      function callWithBadSecondParameter () {
        var tx = new Transaction(transactionOptions)
        tx.commit([], 'badparameter')
      }
      ;(callWithBadSecondParameter).should.throw('Method .commit(statements, [callback]) expects `callback` to be a function')
    })

    it('should return a promise if not passing a callback', function () {
      var tx = new Transaction(transactionOptions)
      tx.commit([]).should.be.a.Promise()
    })
    it('should **NOT** return a promise if passing a callback', function () {
      var tx = new Transaction(transactionOptions)
      should(tx.commit([], function () {})).not.be.a.Promise()
    })

    it('should reject promise with `DatabaseUnavaliable` error if database is not reachable', function (done) {
      var tx = new Transaction(transactionOptions)
      tx._commitEndpoint = 'http://not.exists'
      tx.commit([])
      .then(function () { done(new Error('should reject with `DatabaseUnavaliable` error')) })
      .catch(errors.DatabaseUnavaliable, function () { done() })
      .catch(function () { done(new Error('should reject with `DatabaseUnavaliable` error')) })
    })
    it('should call callback with `DatabaseUnavaliable` error if database is not reachable', function (done) {
      var tx = new Transaction(transactionOptions)
      tx._commitEndpoint = 'http://not.exists'
      tx.commit([], function (err, results) {
        err.should.be.a.instanceOf(errors.DatabaseUnavaliable)
        should(results).be.undefined()
        done()
      })
    })

    it('should reject promise with `Neo4jTransactionErrors` error if Neo4j response contains errors', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.commit([
        tx.stmt('invalid cypher syntax')
      ])
      .then(function () { done(new Error('should reject promise with `Neo4jErrors` error')) })
      .catch(errors.Neo4jTransactionErrors, function (e) {
        e.errors.should.containDeepOrdered([{code: 'Neo.ClientError.Statement.InvalidSyntax'}])
        done()
      })
      .catch(function () { done(new Error('should reject promise with `Neo4jErrors` error')) })
    })
    it('should call callback with `Neo4jTransactionErrors` error if Neo4j response contains errors', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.commit([
        tx.stmt('invalid cypher syntax')
      ], function (err, results) {
        err.should.be.instanceOf(errors.Neo4jTransactionErrors)
        err.errors.should.containDeepOrdered([{code: 'Neo.ClientError.Statement.InvalidSyntax'}])
        should(results).be.undefined()
        done()
      })
    })

    it('should reject promise with `TransactionAlreadyCommitted` error if transaction is already committed', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.commit([
        tx.stmt('CREATE (n:TestNode) SET n.name ="testContent" RETURN n')
      ])
      .then(function () {
        return tx.commit([
          tx.stmt('CREATE (n:TestNode) SET n.name ="testContent2" RETURN n')
        ])
      })
      .catch(errors.TransactionAlreadyCommitted, function () { done() })
      .catch(done)
    })
    it('should call callback with `TransactionAlreadyCommitted` error if transaction is already committed', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.commit([
        tx.stmt('CREATE (n:TestNode) SET n.name ="testContent" RETURN n')
      ], function (err, results) {
        if (err) return done(err)
        tx.commit([
          tx.stmt('CREATE (n:TestNode) SET n.name ="testContent2" RETURN n')
        ], function (err, results) {
          err.should.be.instanceOf(errors.TransactionAlreadyCommitted)
          should(results).be.undefined()
          done()
        })
      })
    })

    it('should reject promise with `TransactionIsRolledBack` error if transaction was previously rolled back', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.transact()
      .then(function () {
        return tx.rollback()
      })
      .then(function () {
        return tx.commit()
      })
      .then(function () { done(new Error('should reject with `TransactionIsRolledBack` error')) })
      .catch(errors.TransactionIsRolledBack, function () { done() })
      .catch(function () { done(new Error('should reject with `TransactionIsRolledBack` error')) })
    })
    it('should call callback with `TransactionIsRolledBack` error if transaction was previously rolled back', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.transact([], function (err, results) {
        if (err) return done(err)
        tx.rollback(function (err) {
          if (err) return done(err)
          tx.commit([], function (err) {
            err.should.be.instanceOf(errors.TransactionIsRolledBack)
            done()
          })
        })
      })
    })

    it('should reject promise with `UnauthorizedAccess` error if Neo4j response statusCode is 401', function (done) {
      // Fixture: remove authorization headers
      var oldAuthorizationHeader = transactionOptions.headers.authorization
      delete transactionOptions.headers.authorization

      var tx = new Transaction(transactionOptions)

      tx.commit([
        tx.stmt('MATCH (n) RETURN n')
      ])
      .then(function () { done(new Error('should reject promise with `UnauthorizedAccess`')) })
      .catch(errors.UnauthorizedAccess, function () { done() })
      .catch(function () { done(new Error('should reject promise with `UnauthorizedAccess`')) })
      .then(function () {
        transactionOptions.headers.authorization = oldAuthorizationHeader
      })
    })
    it('should call callback with `UnauthorizedAccess` error if Neo4j response statusCode is 401', function (done) {
      // Fixture: remove authorization headers
      var oldAuthorizationHeader = transactionOptions.headers.authorization
      delete transactionOptions.headers.authorization

      var tx = new Transaction(transactionOptions)

      tx.commit([
        tx.stmt('MATCH (n) RETURN n')
      ], function (err, results) {
        err.should.be.instanceOf(errors.UnauthorizedAccess)
        should(results).be.undefined()
        transactionOptions.headers.authorization = oldAuthorizationHeader
        done()
      })
    })

    it('results are parsed if `options.parseResult` is truthy', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.commit([
        tx.stmt('CREATE (n:TestNode) SET n.name = "commitParsesResults" RETURN n, LABELS(n)[0] as label')
      ])
      .then(function (results) {
        ;(results[0][0].n.name).should.equal('commitParsesResults')
        ;(results[0][0].label).should.equal('TestNode')
      })
      .then(function () { done() })
      .catch(done)
    })
  })

  describe('.extend([callback])', function () {
    it('should throw if passed a truthy `callback` parameter which is not a function', function () {
      function callWithBadParameter () {
        var tx = new Transaction(transactionOptions)
        tx.extend(42)
      }
      ;(callWithBadParameter).should.throw('Method .extend([callback]) expects `callback` to be a function')
    })

    it('should return a promise if not passing a callback', function () {
      var tx = new Transaction(transactionOptions)
      tx.extend().should.be.a.Promise()
    })
    it('should **NOT** return a promise if passing a callback', function () {
      var tx = new Transaction(transactionOptions)
      should(tx.extend(function () {})).not.be.a.Promise()
    })

    it('calls transaction.transact with an empty array and the callback function if provided', function () {
      var callback = function () {}
      // var emptyArrayMatcher = sinon.match(function (value) {
      //   return Array.isArray(value) && value.length === 0
      // })
      var tx = new Transaction(transactionOptions)
      var extend = sinon.spy(tx, 'transact')
      tx.extend(callback)
      extend.should.be.calledWithExactly([], callback)
      extend.restore()

      extend = sinon.spy(tx, 'transact')
      tx.extend()
      extend.should.be.calledWithExactly([])
      extend.restore()
    })

    it('should update transaction expiration date on every call', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.extend()
      .then(function () {
        return Promise.all([
          tx._expirationDate,
          tx.extend()
        ])
      })
      .spread(function (previousExpirationDate) {
        ;(previousExpirationDate === tx._expirationDate).should.be.false()
        return Promise.all([
          tx._expirationDate,
          tx.extend()
        ])
      })
      .spread(function (previousExpirationDate) {
        ;(previousExpirationDate === tx._expirationDate).should.be.false()
      })
      .then(function () { done() })
      .catch(done)
    })

    it('should reject promise with `TransactionAlreadyCommitted` error if transaction is already committed', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.commit([
        tx.stmt('CREATE (n:TestNode) SET n.name ="testContent" RETURN n')
      ])
      .then(function () {
        return tx.extend()
      })
      .catch(errors.TransactionAlreadyCommitted, function () { done() })
      .catch(done)
    })
    it('should call callback with `TransactionAlreadyCommitted` error if transaction is already committed', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.commit([
        tx.stmt('CREATE (n:TestNode) SET n.name ="testContent" RETURN n')
      ], function (err, results) {
        if (err) return done(err)
        tx.extend(function (err, results) {
          err.should.be.instanceOf(errors.TransactionAlreadyCommitted)
          should(results).be.undefined()
          done()
        })
      })
    })

    it('should reject promise with `TransactionIsRolledBack` error if transaction is already rolledback', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.transact([
        tx.stmt('CREATE (n:TestNode) SET n.name ="testContent" RETURN n')
      ])
      .then(function () {
        return tx.rollback()
      })
      .then(function () {
        tx.extend()
        .then(function () { done(new Error('should reject promise with `TransactionIsRolledBack`')) })
        .catch(errors.TransactionIsRolledBack, function () { done() })
        .catch(done)
      })
      .catch(done)
    })
    it('should call callback with `TransactionIsRolledBack` error if transaction is already rolledback', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.transact([
        tx.stmt('CREATE (n:TestNode) SET n.name ="testContent" RETURN n')
      ], function (err, results) {
        if (err) return done(err)
        tx.rollback(function (err) {
          if (err) return done(err)
          tx.extend(function (err) {
            err.should.be.instanceOf(errors.TransactionIsRolledBack)
            done()
          })
        })
      })
    })
  })

  describe('.rollback([callback])', function () {
    it('should throw if passed a truthy `callback` parameter which is not a function', function () {
      function callWithBadParameter () {
        var tx = new Transaction(transactionOptions)
        tx.rollback(42)
      }
      ;(callWithBadParameter).should.throw('Method .rollback([callback]) expects `callback` to be a function')
    })

    it('should return a promise if not passing a callback', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.transact()
      .then(function () {
        var ret = tx.rollback()
        ret.should.be.Promise()
        return ret
      })
      .then(function () { done() })
      .catch(done)
    })
    it('should **NOT** return a promise if passing a callback', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.transact([], function (err) {
        if (err) return done(err)
        should(tx.rollback(function () {})).not.be.a.Promise()
        done()
      })
    })

    it('should rollback an active transaction', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.transact([
        tx.stmt('CREATE (n:NoFuture) SET n.name = "willNotExist" RETURN n')
      ])
      .then(function () {
        return tx.rollback()
      })
      .then(function () {
        should(tx._rolledBack).be.true()
        var newTx = new Transaction(transactionOptions)
        return newTx.commit([
          newTx.stmt('MATCH (n:NoFuture) WHERE n.name = "willNotExist" RETURN n')
        ])
      })
      .then(function (results) {
        results[0].length.should.equal(0)
      })
      .then(function () { done() })
      .catch(done)
    })

    it('should reject promise with `TransactionAlreadyCommitted` error if transaction is already committed', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.commit([
        tx.stmt('CREATE (n:TestNode) SET n.name ="testContent" RETURN n')
      ])
      .then(function () {
        return tx.rollback()
      })
      .catch(errors.TransactionAlreadyCommitted, function () { done() })
      .catch(done)
    })
    it('should call callback with `TransactionAlreadyCommitted` error if transaction is already committed', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.commit([
        tx.stmt('CREATE (n:TestNode) SET n.name ="testContent" RETURN n')
      ], function (err, results) {
        if (err) return done(err)
        tx.rollback(function (err) {
          err.should.be.instanceOf(errors.TransactionAlreadyCommitted)
          done()
        })
      })
    })

    it('should reject promise with `TransactionIsRolledBack` error if transaction is already rolledback', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.transact([
        tx.stmt('CREATE (n:TestNode) SET n.name ="testContent" RETURN n')
      ])
      .then(function () {
        return tx.rollback()
      })
      .then(function () {
        tx.rollback()
        .then(function () { done(new Error('should reject promise with `TransactionIsRolledBack`')) })
        .catch(errors.TransactionIsRolledBack, function () { done() })
        .catch(function () { done(new Error('should reject promise with `TransactionIsRolledBack`')) })
      })
      .catch(done)
    })
    it('should call callback with `TransactionIsRolledBack` error if transaction is already rolledback', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.transact([
        tx.stmt('CREATE (n:TestNode) SET n.name ="testContent" RETURN n')
      ], function (err, results) {
        if (err) return done(err)
        tx.rollback(function (err) {
          should(err).be.undefined()
          tx.rollback(function (err) {
            err.should.be.instanceOf(errors.TransactionIsRolledBack)
            done()
          })
        })
      })
    })

    it('should reject promise with `TransactionInactive` error if transaction is not active', function (done) {
      var tx = new Transaction(transactionOptions)
      tx.rollback()
      .then(function () { done('should reject promise with `TransactionInactive` error') })
      .catch(errors.TransactionInactive, function () { done() })
      .catch(done)
    })
  })
})
