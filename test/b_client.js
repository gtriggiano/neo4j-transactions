var EventEmitter = require('eventemitter3')
var sinon = require('sinon')
var _ = require('underscore')
var should = require('should')
require('should-sinon')
require('should-promised')

var errors = require('../lib/errors')
var Client = require('../lib/Client')
var Transaction = require('../lib/Transaction')
var Wreck = require('wreck')

var testCredentials = {
  username: 'neo4j',
  password: 'test'
}
// return
describe('Client instance', function () {
  it('should be an EventEmitter', function () {
    var client = new Client()
    client.should.be.instanceOf(EventEmitter)
  })

  it('should expose the `DatabaseUnavaliable` error constructor', function () {
    var client = new Client()
    var databaseUnavaliableError = new client.DatabaseUnavaliable()
    databaseUnavaliableError.should.be.instanceOf(Error)
  })
  it('should expose the `Neo4jTransactionErrors` error constructor', function () {
    var client = new Client()
    var neo4jTransactionErrorsError = new client.Neo4jTransactionErrors()
    neo4jTransactionErrorsError.should.be.instanceOf(Error)
  })
  it('should expose the `UnauthorizedAccess` error constructor', function () {
    var client = new Client()
    var unauthorizedAccessError = new client.UnauthorizedAccess()
    unauthorizedAccessError.should.be.instanceOf(Error)
  })
  it('should expose the `TransactionAlreadyCommitted` error constructor', function () {
    var client = new Client()
    var transactionAlreadyCommittedError = new client.TransactionAlreadyCommitted()
    transactionAlreadyCommittedError.should.be.instanceOf(Error)
  })
  it('should expose the `TransactionIsRolledBack` error constructor', function () {
    var client = new Client()
    var transactionIsRolledBackError = new client.TransactionIsRolledBack()
    transactionIsRolledBackError.should.be.instanceOf(Error)
  })
  it('should expose the `TransactionInactive` error constructor', function () {
    var client = new Client()
    var transactionInactiveError = new client.TransactionInactive()
    transactionInactiveError.should.be.instanceOf(Error)
  })

  it('should attempt a connection to database on instantiation', function () {
    sinon.spy(Client.prototype, 'testNeo4jAvaliability')
    sinon.spy(Wreck, 'get')
    var client = new Client({
      connectionAttempts: _.random(1, 10)
    })
    client.testNeo4jAvaliability.should.be.calledWith(false, client.options.connectionAttempts)
    Wreck.get.should.be.calledWith('http://localhost:7474/db/data/')

    Wreck.get.restore()
    Client.prototype.testNeo4jAvaliability.restore()
  })

  it('should emit a `DatabaseAvaliable` event if database is avaliable', function (done) {
    var client = new Client()
    sinon.spy(client, 'emit')
    client.databaseAvaliable
    .then(function () {
      client.emit.should.be.calledWith('DatabaseAvaliable')
      client.emit.restore()
      done()
    })
  })
  it('should emit a `DatabaseUnavaliable` event if database is unavaliable', function (done) {
    var client = new Client({
      url: 'http://database.unavaliable',
      connectionAttempts: 1
    })
    sinon.spy(client, 'emit')
    client.databaseAvaliable
    .catch(function () {
      client.emit.should.be.calledWith('DatabaseUnavaliable')
      client.emit.restore()
      done()
    })
  })
  it('should emit a `error` event with payload: ([DatabaseUnavaliableError]) if database is unavaliable', function (done) {
    var client = new Client({
      url: 'http://database.unavaliable',
      connectionAttempts: 1
    })
    sinon.spy(client, 'emit')
    client.databaseAvaliable
    .catch(function () {
      client.emit.should.be.calledWith('error', sinon.match(function (err) { return err instanceof errors.DatabaseUnavaliable }))
      client.emit.restore()
      done()
    })
  })

  it('should emit a `DatabaseUnavaliable` event each time a (transact|commit|extend|rollback) method of a child transaction fails because of database unavaliability', function (done) {
    var client = new Client()
    client
    .databaseAvaliable
    .then(function () {
      sinon.spy(client, 'emit')
      var tx = client.transaction()

      // Let's simulate unavaliability
      tx._transactionEndpoint = 'http://not.exists'
      tx._commitEndpoint = 'http://not.exists'

      tx.transact([])
      .catch(function () {
        client.emit.should.be.calledWith('DatabaseUnavaliable')
        client.emit.restore()
        sinon.spy(client, 'emit')
        return tx.extend()
      })
      .catch(function () {
        client.emit.should.be.calledWith('DatabaseUnavaliable')
        client.emit.restore()
        sinon.spy(client, 'emit')
        return tx.commit([])
      })
      .catch(function () {
        client.emit.should.be.calledWith('DatabaseUnavaliable')
        client.emit.restore()
        sinon.spy(client, 'emit')
        return tx.rollback()
      })
      .catch(function () {
        client.emit.should.be.calledWith('DatabaseUnavaliable')
        client.emit.restore()
        done()
      })
    })
  })
  it('should emit a `tx:error` event with a payload: ([DatabaseUnavaliableError]) each time a (transact|commit|extend|rollback) method of a child transaction fails because of database unavaliability', function (done) {
    var client = new Client()
    client
    .databaseAvaliable
    .then(function () {
      sinon.spy(client, 'emit')
      var tx = client.transaction()

      // Let's simulate unavaliability
      tx._transactionEndpoint = 'http://not.exists'
      tx._commitEndpoint = 'http://not.exists'

      tx.transact([])
      .catch(function () {
        client.emit.should.be.calledWith('tx:error', sinon.match(function (val) { return val instanceof errors.DatabaseUnavaliable }))
        client.emit.restore()
        sinon.spy(client, 'emit')
        return tx.extend()
      })
      .catch(function () {
        client.emit.should.be.calledWith('tx:error', sinon.match(function (val) { return val instanceof errors.DatabaseUnavaliable }))
        client.emit.restore()
        sinon.spy(client, 'emit')
        return tx.commit([])
      })
      .catch(function () {
        client.emit.should.be.calledWith('tx:error', sinon.match(function (val) { return val instanceof errors.DatabaseUnavaliable }))
        client.emit.restore()
        sinon.spy(client, 'emit')
        return tx.rollback()
      })
      .catch(function () {
        client.emit.should.be.calledWith('tx:error', sinon.match(function (val) { return val instanceof errors.DatabaseUnavaliable }))
        client.emit.restore()
      })
      .then(function () { done() })
      .catch(done)
    })
  })
  it('should emit a `DatabaseAvaliable` event each time a (transact|commit|extend!rollback) method of a child transaction successfully comunicates with the database', function (done) {
    var client = new Client({
      credentials: testCredentials
    })
    client
    .databaseAvaliable
    .then(function () {
      sinon.spy(client, 'emit')
      var tx = client.transaction()
      tx.transact([])
      .then(function () {
        client.emit.should.be.calledWith('DatabaseAvaliable')
        client.emit.restore()
        sinon.spy(client, 'emit')
        return tx.extend()
      })
      .then(function () {
        client.emit.should.be.calledWith('DatabaseAvaliable')
        client.emit.restore()
        sinon.spy(client, 'emit')
        return tx.rollback()
      })
      .then(function () {
        client.emit.should.be.calledWith('DatabaseAvaliable')
        client.emit.restore()
        sinon.spy(client, 'emit')
        var tx = client.transaction()
        return tx.commit([])
      })
      .then(function () {
        client.emit.should.be.calledWith('DatabaseAvaliable')
        client.emit.restore()
        done()
      })
      .catch(done)
    })
  })

  it('should emit a `tx:error` event with payload: (`UnauthorizedAccessError`) each time a (transact|commit|extend) call by a child transaction fails because is unauthorized to access the database', function (done) {
    var errorCount = 0
    var client = new Client({
      credentials: testCredentials
    })

    client.on('tx:error', function (err) {
      if (err instanceof errors.UnauthorizedAccess) errorCount++
    })

    client
    .databaseAvaliable
    .then(function () {
      var tx = client.transaction()

      // Let's simulate a wrong credential case
      // var cacheHeaders = tx._wreckOptions.headers
      delete tx._wreckOptions.headers

      tx.transact([])
      .catch(function () {
        errorCount.should.equal(1)
        return tx.extend()
      })
      .catch(function () {
        errorCount.should.equal(2)
        return tx.commit([])
      })
      .catch(function () {
        errorCount.should.equal(3)
        done()
      })
      .catch(done)
    })
    .catch(done)
  })
  it('should emit a `tx:error` event with payload: (`Neo4jTransactionErrors`) each time a (transact|commit) call by a child transaction produces any error by Neo4j', function (done) {
    var errorCount = 0
    var client = new Client({
      credentials: testCredentials
    })

    client.on('tx:error', function (err) {
      if (err instanceof errors.Neo4jTransactionErrors) errorCount++
    })

    client
    .databaseAvaliable
    .then(function () {
      var tx = client.transaction()

      tx.transact([
        tx.stmt('invalid syntax')
      ])
      .catch(function () {
        errorCount.should.equal(1)
        return tx.commit([
          tx.stmt('invalid syntax')
        ])
      })
      .catch(function () {
        errorCount.should.equal(2)
        done()
      })
      .catch(done)
    })
    .catch(done)
  })
  it('should emit a `tx:error` event with payload: (`TransactionAlreadyCommitted`) when .(transact|commit|extend|rollback) is called on a child transaction which is already committed', function (done) {
    var errorCount = 0
    var client = new Client({credentials: testCredentials})

    client.on('tx:error', function (error) {
      if (error instanceof errors.TransactionAlreadyCommitted) errorCount++
    })

    client
    .databaseAvaliable
    .then(function () {
      var tx = client.transaction()
      tx.commit([])
      .then(function () {
        return tx.commit([])
      })
      .catch(function () {
        errorCount.should.equal(1)
        return tx.transact([])
      })
      .catch(function () {
        errorCount.should.equal(2)
        return tx.extend()
      })
      .catch(function () {
        errorCount.should.equal(3)
        return tx.rollback()
      })
      .catch(function () {
        errorCount.should.equal(4)
      })
      .then(done)
      .catch(done)
    })
  })
  it('should emit a `tx:error` event with payload: (`TransactionIsRolledBack`) when .(transact|commit|extend|rollback) is called on a child transaction which is already rolledback', function (done) {
    var errorCount = 0
    var client = new Client({credentials: testCredentials})

    client.on('tx:error', function (error) {
      if (error instanceof errors.TransactionIsRolledBack) errorCount++
    })

    client
    .databaseAvaliable
    .then(function () {
      var tx = client.transaction()
      tx.transact([])
      .then(function () {
        return tx.rollback()
      })
      .then(function (e) {
        return tx.transact([])
      })
      .catch(function (e) {
        errorCount.should.equal(1)
        return tx.commit([])
      })
      .catch(function () {
        errorCount.should.equal(2)
        return tx.extend()
      })
      .catch(function () {
        errorCount.should.equal(3)
        return tx.rollback()
      })
      .catch(function () {
        errorCount.should.equal(4)
      })
      .then(done)
      .catch(done)
    })
  })
  it('should emit a `tx:error` event with payload: (`TransactionInactive`) when .rollback() is called on a transaction wich IS NOT active yet', function (done) {
    var errorCount = 0
    var client = new Client({credentials: testCredentials})

    client.on('tx:error', function (error) {
      if (error instanceof errors.TransactionInactive) errorCount++
    })

    client
    .databaseAvaliable
    .then(function () {
      var tx = client.transaction()
      tx.rollback()
      .catch(function (e) {
        errorCount.should.equal(1)
      })
      .then(done)
      .catch(done)
    })
  })

  describe('.databaseAvaliable', function () {
    it('should be a promise', function () {
      var client = new Client()
      client.databaseAvaliable.should.be.a.Promise()
    })

    it('should be rejected whith error `DatabaseUnavaliable` if database is not avaliable', function (done) {
      var client = new Client({
        url: 'http://database.unavaliable',
        connectionAttempts: 1
      })
      client.databaseAvaliable
      .then(function () { done(new Error('client.databaseAvaliable should be rejected with `DatabaseUnavaliableError` error')) })
      .catch(errors.DatabaseUnavaliable, function () { done() })
      .catch(done)
    })
    it('should be resolved if database is avaliable', function (done) {
      var client = new Client()
      client.databaseAvaliable
      .then(done)
      .catch(done)
    })

    it('should be re-setted on every .testNeo4jAvaliability() call', function (done) {
      var client = new Client()
      var previousDatabaseAvaliable = client.databaseAvaliable
      client.databaseAvaliable
      .then(function () {
        client.testNeo4jAvaliability()
        ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
        previousDatabaseAvaliable = client.databaseAvaliable
        client.testNeo4jAvaliability()
        ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
      })
      .then(done)
      .catch(done)
    })
    it('should be re-setted every time a child transaction (commit|transact|extend|rollback) call succesfully comunicates with the database', function (done) {
      var client = new Client({credentials: testCredentials})
      var previousDatabaseAvaliable = client.databaseAvaliable
      client.databaseAvaliable
      .then(function () {
        var tx = client.transaction()

        return tx.extend()
          .then(function () {
            ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
            previousDatabaseAvaliable = client.databaseAvaliable
            return tx.transact([
              tx.stmt('MATCH (n) RETURN n')
            ])
          })
          .then(function () {
            ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
            previousDatabaseAvaliable = client.databaseAvaliable
            return tx.commit([
              tx.stmt('MATCH (n) RETURN n')
            ])
          })
          .then(function () {
            ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
            previousDatabaseAvaliable = client.databaseAvaliable

            var tx = client.transaction()

            return tx.extend()
              .then(function () {
                ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
                previousDatabaseAvaliable = client.databaseAvaliable
                return tx.rollback()
              })
              .then(function () {
                ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
              })
          })
      })
      .then(done)
      .catch(done)
    })
    it('should be re-setted every time a child transaction (commit|transact|extend|rollback) call fails because of database unavaliability', function (done) {
      var client = new Client({credentials: testCredentials})
      var previousDatabaseAvaliable = client.databaseAvaliable

      client.databaseAvaliable
      .then(function () {
        var tx = client.transaction()
        var originalTransactionEndpoint = tx._transactionEndpoint
        tx._transactionEndpoint = 'http://not.exists'
        tx._commitEndpoint = 'http://not.exists'

        return tx.extend()
          .catch(errors.DatabaseUnavaliable, function () {
            ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
            previousDatabaseAvaliable = client.databaseAvaliable
            return tx.commit()
          })
          .catch(errors.DatabaseUnavaliable, function () {
            ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
            previousDatabaseAvaliable = client.databaseAvaliable
            return tx.transact()
          })
          .catch(errors.DatabaseUnavaliable, function () {
            ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
            previousDatabaseAvaliable = client.databaseAvaliable
            tx._transactionEndpoint = originalTransactionEndpoint
            return tx.transact()
              .then(function () {
                ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
                previousDatabaseAvaliable = client.databaseAvaliable
                tx._transactionEndpoint = 'http://not.exists'
                return tx.rollback()
              })
              .catch(errors.DatabaseUnavaliable, function () {
                ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
                previousDatabaseAvaliable = client.databaseAvaliable
              })
          })
      })
      .then(done)
      .catch(done)
    })
  })
  describe('.transaction()', function () {
    it('should be a function', function () {
      var client = new Client()
      client.transaction.should.be.a.Function()
    })
    it('should return a Transaction instance', function () {
      var client = new Client()
      var transaction = client.transaction()
      transaction.should.be.instanceOf(Transaction)
    })
  })

  describe('.testNeo4jAvaliability([silence], [timesToRepeat])', function () {
    it('should return the client instance for chainability', function () {
      var client = new Client()
      var c1 = client.testNeo4jAvaliability()
      ;(c1 === client).should.be.true()
    })
    it('should set a new `client.databaseAvaliable` promise on each call', function () {
      var client = new Client()
      var oldPromise = client.databaseAvaliable
      var newPromise = client.testNeo4jAvaliability().databaseAvaliable
      ;(oldPromise !== newPromise).should.be.true()
    })
    it('client should NOT emit any event if `silence` is true', function (done) {
      var client = new Client()
      client
      .databaseAvaliable
      .then(function () {
        sinon.spy(client, 'emit')
        return client.testNeo4jAvaliability(true).databaseAvaliable
      })
      .then(function () {
        client.emit.should.not.be.called()
        client.options.url.data = 'http://not.exists'
        return client.testNeo4jAvaliability(true).databaseAvaliable.catch(function () {})
      })
      .then(function () {
        client.emit.should.not.be.called()
        client.emit.restore()
      })
      .then(done)
      .catch(done)
    })
    it('should test the database avaliability `timesToRepeat` times before surrender', function (done) {
      var timesToRepeat = _.random(0, 4)
      var timeout = (timesToRepeat || 1) * 1300
      var unavaliableEvents = 0
      this.timeout(timeout + 600)

      var client = new Client()
      sinon.spy(Wreck, 'get')
      client
      .databaseAvaliable
      .then(function () {
        client.options.url.data = 'http://not.exists' // Simulate database unavaliability
        client.on('DatabaseUnavaliable', function () {
          unavaliableEvents++
        })
        client.testNeo4jAvaliability(false, timesToRepeat)
        setTimeout(function () {
          Wreck.get.should.have.callCount(timesToRepeat || 1)
          unavaliableEvents.should.equal(timesToRepeat || 1)
          Wreck.get.restore()
          done()
        }, timeout)
      })
      .catch(done)
    })
  })

  describe('.updateCredentials([username], [password])', function () {
    it('should set a new authorization header for future database calls by the client or its transactions', function () {
      var client = new Client({credentials: testCredentials})
      var tx = client.transaction()
      var oldHeader = client.options.headers.authorization
      ;(client.options.headers.authorization === tx._wreckOptions.headers.authorization).should.be.true()
      client.updateCredentials('giacomo', 'mypass')
      ;(oldHeader !== client.options.headers.authorization).should.be.true()
      ;(client.options.headers.authorization === tx._wreckOptions.headers.authorization).should.be.true()
    })
    it('should remove the authorization header from future calls by the client or its transactions if called without `username` or `password` arguments', function () {
      var client = new Client({credentials: testCredentials})
      var tx = client.transaction()
      client.updateCredentials()
      should(client.options.headers.authorization).be.undefined()
      should(tx._wreckOptions.headers.authorization).be.undefined()
    })
  })
})
