require('should')
var Neo4j = require('../lib')
var Client = require('../lib/Client')
// return
describe('Neo4j([options])', function () {
  it('should be a function', function () {
    Neo4j.should.be.a.Function()
  })
  it('should return a Client instance', function () {
    var client = Neo4j()
    client.should.be.an.instanceOf(Client)
  })
  it('should expose the `DatabaseUnavaliable` error constructor', function () {
    var databaseUnavaliableError = new Neo4j.DatabaseUnavaliable()
    databaseUnavaliableError.should.be.instanceOf(Error)
  })
  it('should expose the `Neo4jTransactionErrors` error constructor', function () {
    var neo4jTransactionErrorsError = new Neo4j.Neo4jTransactionErrors()
    neo4jTransactionErrorsError.should.be.instanceOf(Error)
  })
  it('should expose the `UnauthorizedAccess` error constructor', function () {
    var unauthorizedAccessError = new Neo4j.UnauthorizedAccess()
    unauthorizedAccessError.should.be.instanceOf(Error)
  })
  it('should expose the `TransactionAlreadyCommitted` error constructor', function () {
    var transactionAlreadyCommittedError = new Neo4j.TransactionAlreadyCommitted()
    transactionAlreadyCommittedError.should.be.instanceOf(Error)
  })
  it('should expose the `TransactionIsRolledBack` error constructor', function () {
    var transactionIsRolledBackError = new Neo4j.TransactionIsRolledBack()
    transactionIsRolledBackError.should.be.instanceOf(Error)
  })
  it('should expose the `TransactionInactive` error constructor', function () {
    var transactionInactiveError = new Neo4j.TransactionInactive()
    transactionInactiveError.should.be.instanceOf(Error)
  })
})
