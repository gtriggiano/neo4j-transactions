# Tests output
# TOC
   - [Neo4j([options])](#neo4joptions)
   - [Client instance](#client-instance)
     - [.databaseAvaliable](#client-instance-databaseavaliable)
     - [.transaction()](#client-instance-transaction)
     - [.tx()](#client-instance-tx)
     - [.testNeo4jAvaliability([silence], [timesToRepeat])](#client-instance-testneo4javaliabilitysilence-timestorepeat)
     - [.updateCredentials([username], [password])](#client-instance-updatecredentialsusername-password)
   - [Transaction instance](#transaction-instance)
     - [.statement(query, [parameters])](#transaction-instance-statementquery-parameters)
     - [.stmt(query, [parameters])](#transaction-instance-stmtquery-parameters)
     - [.transact(statements, [callback])](#transaction-instance-transactstatements-callback)
     - [.commit(statements, [callback])](#transaction-instance-commitstatements-callback)
     - [.extend([callback])](#transaction-instance-extendcallback)
     - [.rollback([callback])](#transaction-instance-rollbackcallback)
<a name=""></a>
 
<a name="neo4joptions"></a>
# Neo4j([options])
should be a function.

```js
Neo4j.should.be.a.Function()
```

should return a Client instance.

```js
var client = Neo4j()
client.should.be.an.instanceOf(Client)
```

should expose the `DatabaseUnavaliable` error constructor.

```js
var databaseUnavaliableError = new Neo4j.DatabaseUnavaliable()
databaseUnavaliableError.should.be.instanceOf(Error)
```

should expose the `Neo4jTransactionErrors` error constructor.

```js
var neo4jTransactionErrorsError = new Neo4j.Neo4jTransactionErrors()
neo4jTransactionErrorsError.should.be.instanceOf(Error)
```

should expose the `UnauthorizedAccess` error constructor.

```js
var unauthorizedAccessError = new Neo4j.UnauthorizedAccess()
unauthorizedAccessError.should.be.instanceOf(Error)
```

should expose the `TransactionAlreadyCommitted` error constructor.

```js
var transactionAlreadyCommittedError = new Neo4j.TransactionAlreadyCommitted()
transactionAlreadyCommittedError.should.be.instanceOf(Error)
```

should expose the `TransactionIsRolledBack` error constructor.

```js
var transactionIsRolledBackError = new Neo4j.TransactionIsRolledBack()
transactionIsRolledBackError.should.be.instanceOf(Error)
```

should expose the `TransactionInactive` error constructor.

```js
var transactionInactiveError = new Neo4j.TransactionInactive()
transactionInactiveError.should.be.instanceOf(Error)
```

<a name="client-instance"></a>
# Client instance
should be an EventEmitter.

```js
var client = new Client()
client.should.be.instanceOf(EventEmitter)
```

should expose the `DatabaseUnavaliable` error constructor.

```js
var client = new Client()
var databaseUnavaliableError = new client.DatabaseUnavaliable()
databaseUnavaliableError.should.be.instanceOf(Error)
```

should expose the `Neo4jTransactionErrors` error constructor.

```js
var client = new Client()
var neo4jTransactionErrorsError = new client.Neo4jTransactionErrors()
neo4jTransactionErrorsError.should.be.instanceOf(Error)
```

should expose the `UnauthorizedAccess` error constructor.

```js
var client = new Client()
var unauthorizedAccessError = new client.UnauthorizedAccess()
unauthorizedAccessError.should.be.instanceOf(Error)
```

should expose the `TransactionAlreadyCommitted` error constructor.

```js
var client = new Client()
var transactionAlreadyCommittedError = new client.TransactionAlreadyCommitted()
transactionAlreadyCommittedError.should.be.instanceOf(Error)
```

should expose the `TransactionIsRolledBack` error constructor.

```js
var client = new Client()
var transactionIsRolledBackError = new client.TransactionIsRolledBack()
transactionIsRolledBackError.should.be.instanceOf(Error)
```

should expose the `TransactionInactive` error constructor.

```js
var client = new Client()
var transactionInactiveError = new client.TransactionInactive()
transactionInactiveError.should.be.instanceOf(Error)
```

should attempt a connection to database on instantiation.

```js
sinon.spy(Client.prototype, 'testNeo4jAvaliability')
sinon.spy(Wreck, 'get')
var client = new Client({
  connectionAttempts: _.random(1, 10)
})
client.testNeo4jAvaliability.should.be.calledWith(false, client.options.connectionAttempts)
Wreck.get.should.be.calledWith('http://localhost:7474/db/data/')
Wreck.get.restore()
Client.prototype.testNeo4jAvaliability.restore()
```

should emit a `DatabaseAvaliable` event if database is avaliable.

```js
var client = new Client()
sinon.spy(client, 'emit')
client.databaseAvaliable
.then(function () {
  client.emit.should.be.calledWith('DatabaseAvaliable')
  client.emit.restore()
  done()
})
```

should emit a `DatabaseUnavaliable` event if database is unavaliable.

```js
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
```

should emit a `error` event with payload: ([DatabaseUnavaliableError]) if database is unavaliable.

```js
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
```

should emit a `DatabaseUnavaliable` event each time a (transact|commit|extend|rollback) method of a child transaction fails because of database unavaliability.

```js
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
```

should emit a `tx:error` event with a payload: ([DatabaseUnavaliableError]) each time a (transact|commit|extend|rollback) method of a child transaction fails because of database unavaliability.

```js
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
```

should emit a `DatabaseAvaliable` event each time a (transact|commit|extend!rollback) method of a child transaction successfully comunicates with the database.

```js
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
```

should emit a `tx:error` event with payload: (`UnauthorizedAccessError`) each time a (transact|commit|extend) call by a child transaction fails because is unauthorized to access the database.

```js
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
```

should emit a `tx:error` event with payload: (`Neo4jTransactionErrors`) each time a (transact|commit) call by a child transaction produces any error by Neo4j.

```js
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
```

should emit a `tx:error` event with payload: (`TransactionAlreadyCommitted`) when .(transact|commit|extend|rollback) is called on a child transaction which is already committed.

```js
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
```

should emit a `tx:error` event with payload: (`TransactionIsRolledBack`) when .(transact|commit|extend|rollback) is called on a child transaction which is already rolledback.

```js
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
```

should emit a `tx:error` event with payload: (`TransactionInactive`) when .rollback() is called on a transaction wich IS NOT active yet.

```js
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
```

<a name="client-instance-databaseavaliable"></a>
## .databaseAvaliable
should be a promise.

```js
var client = new Client()
client.databaseAvaliable.should.be.a.Promise()
```

should be rejected whith error `DatabaseUnavaliable` if database is not avaliable.

```js
var client = new Client({
  url: 'http://database.unavaliable',
  connectionAttempts: 1
})
client.databaseAvaliable
.then(function () { done(new Error('client.databaseAvaliable should be rejected with `DatabaseUnavaliableError` error')) })
.catch(errors.DatabaseUnavaliable, function () { done() })
.catch(done)
```

should be resolved if database is avaliable.

```js
var client = new Client()
client.databaseAvaliable
.then(done)
.catch(done)
```

should be re-setted on every .testNeo4jAvaliability() call.

```js
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
```

should be re-setted every time a child transaction (commit|transact|extend|rollback) call succesfully comunicates with the database.

```js
var client = new Client({credentials: testCredentials})
var previousDatabaseAvaliable = client.databaseAvaliable
client.databaseAvaliable
.then(function () {
  var tx = client.transaction()
  return tx.extend()
    .then(function () {
      ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
      client.databaseAvaliable.isFulfilled().should.be.true()
      previousDatabaseAvaliable = client.databaseAvaliable
      return tx.transact([
        tx.stmt('MATCH (n) RETURN n')
      ])
    })
    .then(function () {
      ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
      client.databaseAvaliable.isFulfilled().should.be.true()
      previousDatabaseAvaliable = client.databaseAvaliable
      return tx.commit([
        tx.stmt('MATCH (n) RETURN n')
      ])
    })
    .then(function () {
      ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
      client.databaseAvaliable.isFulfilled().should.be.true()
      previousDatabaseAvaliable = client.databaseAvaliable
      var tx = client.transaction()
      return tx.extend()
        .then(function () {
          ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
          client.databaseAvaliable.isFulfilled().should.be.true()
          previousDatabaseAvaliable = client.databaseAvaliable
          return tx.rollback()
        })
        .then(function () {
          ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
          client.databaseAvaliable.isFulfilled().should.be.true()
        })
    })
})
.then(done)
.catch(done)
```

should be re-setted every time a child transaction (commit|transact|extend|rollback) call fails because of database unavaliability.

```js
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
      client.databaseAvaliable.isRejected().should.be.true()
      previousDatabaseAvaliable = client.databaseAvaliable
      return tx.commit()
    })
    .catch(errors.DatabaseUnavaliable, function () {
      ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
      client.databaseAvaliable.isRejected().should.be.true()
      previousDatabaseAvaliable = client.databaseAvaliable
      return tx.transact()
    })
    .catch(errors.DatabaseUnavaliable, function () {
      ;(previousDatabaseAvaliable !== client.databaseAvaliable).should.be.true()
      client.databaseAvaliable.isRejected().should.be.true()
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
```

<a name="client-instance-transaction"></a>
## .transaction()
should be a function.

```js
var client = new Client()
client.transaction.should.be.a.Function()
```

should return a Transaction instance.

```js
var client = new Client()
var transaction = client.transaction()
transaction.should.be.instanceOf(Transaction)
```

<a name="client-instance-tx"></a>
## .tx()
should be an alias of `.transaction()`.

```js
var client = new Client()
;(client.tx === client.transaction).should.be.true()
```

<a name="client-instance-testneo4javaliabilitysilence-timestorepeat"></a>
## .testNeo4jAvaliability([silence], [timesToRepeat])
should return the client instance for chainability.

```js
var client = new Client()
var c1 = client.testNeo4jAvaliability()
;(c1 === client).should.be.true()
```

should set a new `client.databaseAvaliable` promise on each call.

```js
var client = new Client()
var oldPromise = client.databaseAvaliable
var newPromise = client.testNeo4jAvaliability().databaseAvaliable
;(oldPromise !== newPromise).should.be.true()
```

client should NOT emit any event if `silence` is true.

```js
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
```

should test the database avaliability `timesToRepeat` times before surrender.

```js
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
```

<a name="client-instance-updatecredentialsusername-password"></a>
## .updateCredentials([username], [password])
should set a new authorization header for future database calls by the client or its transactions.

```js
var client = new Client({credentials: testCredentials})
var tx = client.transaction()
var oldHeader = client.options.headers.authorization
;(client.options.headers.authorization === tx._wreckOptions.headers.authorization).should.be.true()
client.updateCredentials('giacomo', 'mypass')
;(oldHeader !== client.options.headers.authorization).should.be.true()
;(client.options.headers.authorization === tx._wreckOptions.headers.authorization).should.be.true()
```

should remove the authorization header from future calls by the client or its transactions if called without `username` or `password` arguments.

```js
var client = new Client({credentials: testCredentials})
var tx = client.transaction()
client.updateCredentials()
should(client.options.headers.authorization).be.undefined()
should(tx._wreckOptions.headers.authorization).be.undefined()
```

<a name="transaction-instance"></a>
# Transaction instance
should be an EventEmitter.

```js
var tx = new Transaction(transactionOptions)
tx.should.be.instanceOf(EventEmitter)
```

should expose the `DatabaseUnavaliable` error constructor.

```js
var tx = new Transaction(transactionOptions)
var databaseUnavaliableError = new tx.DatabaseUnavaliable()
databaseUnavaliableError.should.be.instanceOf(Error)
```

should expose the `Neo4jTransactionErrors` error constructor.

```js
var tx = new Transaction(transactionOptions)
var neo4jTransactionErrorsError = new tx.Neo4jTransactionErrors()
neo4jTransactionErrorsError.should.be.instanceOf(Error)
```

should expose the `UnauthorizedAccess` error constructor.

```js
var tx = new Transaction(transactionOptions)
var unauthorizedAccessError = new tx.UnauthorizedAccess()
unauthorizedAccessError.should.be.instanceOf(Error)
```

should expose the `TransactionAlreadyCommitted` error constructor.

```js
var tx = new Transaction(transactionOptions)
var transactionAlreadyCommittedError = new tx.TransactionAlreadyCommitted()
transactionAlreadyCommittedError.should.be.instanceOf(Error)
```

should expose the `TransactionIsRolledBack` error constructor.

```js
var tx = new Transaction(transactionOptions)
var transactionIsRolledBackError = new tx.TransactionIsRolledBack()
transactionIsRolledBackError.should.be.instanceOf(Error)
```

should expose the `TransactionInactive` error constructor.

```js
var tx = new Transaction(transactionOptions)
var transactionInactiveError = new tx.TransactionInactive()
transactionInactiveError.should.be.instanceOf(Error)
```

should emit a `DatabaseUnavaliable` event each time a (transact|commit|extend|rollback) method fails because of database unavaliability.

```js
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
```

should emit a `DatabaseAvaliable` event each time a (transact|commit|extend!rollback) method successfully comunicates with the database.

```js
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
```

should emit a `error` event with a payload: (`Error: DatabaseUnavaliableError`) each time a (transact|commit|extend|rollback) method fails because of database unavaliability.

```js
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
```

should emit a `error` event with payload: (`Error: UnauthorizedAccessError`) each time a (transact|commit|extend) call fails because is unauthorized to access the database.

```js
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
```

should emit a `error` event with payload: (`Error: Neo4jTransactionErrors`) each time a (transact|commit) call produces any error by Neo4j.

```js
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
```

should emit a `error` event with payload: (`Error: TransactionAlreadyCommitted`) when .(transact|commit|extend|rollback) is called and the transaction was previously committed.

```js
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
```

should emit a `error` event with payload: (`Error: TransactionIsRolledBack`) when .(transact|commit|extend|rollback) is called and the transaction was previously rolledback.

```js
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
```

should emit a `error` event with payload: (`Error: TransactionInactive`) when .rollback() is called while the transaction IS NOT already active (aka: didn't complete a first .transact() or .extend() call).

```js
var tx = new Transaction(transactionOptions)
sinon.spy(tx, 'emit')
tx.rollback()
.catch(errors.TransactionInactive, function () {
  tx.emit.should.be.calledWith('error', sinon.match(function (val) { return val instanceof errors.TransactionInactive }))
  tx.emit.restore()
})
.then(done)
.catch(done)
```

<a name="transaction-instance-statementquery-parameters"></a>
## .statement(query, [parameters])
should throw if `query` is not a string or an array of strings.

```js
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
```

should throw if `parameters` is provided and is not an object.

```js
function callWithBadParametersArgument () {
  var tx = new Transaction(transactionOptions)
  tx.statement('MATCH (n) RETURN n', 42)
}
(callWithBadParametersArgument).should.throw('Method .statement(query, [parameters]) expects `parameters` to be an object')
```

should return a valid statement object being passed a string as `query`.

```js
var tx = new Transaction(transactionOptions)
var parameters = {userId: 'xyz'}
var statement = tx.statement('MATCH (n) RETURN n', parameters)
statement.statement.should.be.a.String()
statement.parameters.should.be.an.Object()
statement.parameters.userId.should.equal(parameters.userId)
```

should return a valid statement object being passed an array of strings as `query`.

```js
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
```

<a name="transaction-instance-stmtquery-parameters"></a>
## .stmt(query, [parameters])
should be an alias of `.statement(query, [parameters])`.

```js
var tx = new Transaction(transactionOptions)
;(tx.statement === tx.stmt).should.be.true()
```

<a name="transaction-instance-transactstatements-callback"></a>
## .transact(statements, [callback])
should throw if `statements` is not an array.

```js
(function callWithBadFirstParameter () {
  var tx = new Transaction(transactionOptions)
  tx.transact('badparameter')
}).should.throw('Method .transact(statements, [callback]) expects `statements` to be an array')
```

should throw if `statements` objects are not in the form of {statement: String, [parameters]: Object}.

```js
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
```

should throw if passed a truthy `callback` parameter which is not a functionn.

```js
function callWithBadSecondParameter () {
  var tx = new Transaction(transactionOptions)
  tx.transact([], 'badparameter')
}
;(callWithBadSecondParameter).should.throw('Method .transact(statements, [callback]) expects `callback` to be a function')
```

should return a promise if not passing a callback.

```js
var tx = new Transaction(transactionOptions)
tx.transact().should.be.a.Promise()
```

should **NOT** return a promise if passing a callback.

```js
var tx = new Transaction(transactionOptions)
should(tx.transact([], function () {})).not.be.a.Promise()
```

should update the transaction endpoint after the first call.

```js
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
```

should update transaction expiration date on every call.

```js
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
```

should reject promise with `DatabaseUnavaliable` error if database is not reachable.

```js
var tx = new Transaction(transactionOptions)
tx._transactionEndpoint = 'http://not.exists'
tx.transact([])
.then(function () { done(new Error('should reject with `DatabaseUnavaliable` error')) })
.catch(errors.DatabaseUnavaliable, function () { done() })
.catch(function () { done(new Error('should reject with `DatabaseUnavaliable` error')) })
```

should call callback with `DatabaseUnavaliable` error if database is not reachable.

```js
var tx = new Transaction(transactionOptions)
tx._transactionEndpoint = 'http://not.exists'
tx.transact([], function (err, results) {
  err.should.be.a.instanceOf(errors.DatabaseUnavaliable)
  should(results).be.undefined()
  done()
})
```

should reject promise with `Neo4jTransactionErrors` error if Neo4j response contains errors.

```js
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
```

should call callback with `Neo4jTransactionErrors` error if Neo4j response contains errors.

```js
var tx = new Transaction(transactionOptions)
tx.transact([
  tx.stmt('invalid cypher syntax')
], function (err, results) {
  err.should.be.instanceOf(errors.Neo4jTransactionErrors)
  err.errors.should.containDeepOrdered([{code: 'Neo.ClientError.Statement.InvalidSyntax'}])
  should(results).be.undefined()
  done()
})
```

should reject promise with `TransactionAlreadyCommitted` error if transaction is already committed.

```js
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
```

should call callback with `TransactionAlreadyCommitted` error if transaction is already committed.

```js
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
```

should reject promise with `TransactionIsRolledBack` error if transaction was previously rolled back.

```js
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
```

should call callback with `TransactionIsRolledBack` error if transaction was previously rolled back.

```js
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
```

should reject promise with `UnauthorizedAccess` error if Neo4j response statusCode is 401.

```js
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
```

should call callback with `UnauthorizedAccess` error if Neo4j response statusCode is 401.

```js
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
```

results are parsed if `options.parseResult` is truthy.

```js
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
```

results are NOT parsed if `options.parseResult` is NOT truthy.

```js
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
```

<a name="transaction-instance-commitstatements-callback"></a>
## .commit(statements, [callback])
should throw if `statements` is not an array.

```js
(function callWithBadFirstParameter () {
  var tx = new Transaction(transactionOptions)
  tx.commit('badparameter')
}).should.throw('Method .commit(statements, [callback]) expects `statements` to be an array')
```

should throw if `statements` objects are not in the form of {statement: String, [parameters]: Object}.

```js
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
```

should throw if passed a truthy `callback` parameter which is not a function.

```js
function callWithBadSecondParameter () {
  var tx = new Transaction(transactionOptions)
  tx.commit([], 'badparameter')
}
;(callWithBadSecondParameter).should.throw('Method .commit(statements, [callback]) expects `callback` to be a function')
```

should return a promise if not passing a callback.

```js
var tx = new Transaction(transactionOptions)
tx.commit([]).should.be.a.Promise()
```

should **NOT** return a promise if passing a callback.

```js
var tx = new Transaction(transactionOptions)
should(tx.commit([], function () {})).not.be.a.Promise()
```

should reject promise with `DatabaseUnavaliable` error if database is not reachable.

```js
var tx = new Transaction(transactionOptions)
tx._commitEndpoint = 'http://not.exists'
tx.commit([])
.then(function () { done(new Error('should reject with `DatabaseUnavaliable` error')) })
.catch(errors.DatabaseUnavaliable, function () { done() })
.catch(function () { done(new Error('should reject with `DatabaseUnavaliable` error')) })
```

should call callback with `DatabaseUnavaliable` error if database is not reachable.

```js
var tx = new Transaction(transactionOptions)
tx._commitEndpoint = 'http://not.exists'
tx.commit([], function (err, results) {
  err.should.be.a.instanceOf(errors.DatabaseUnavaliable)
  should(results).be.undefined()
  done()
})
```

should reject promise with `Neo4jTransactionErrors` error if Neo4j response contains errors.

```js
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
```

should call callback with `Neo4jTransactionErrors` error if Neo4j response contains errors.

```js
var tx = new Transaction(transactionOptions)
tx.commit([
  tx.stmt('invalid cypher syntax')
], function (err, results) {
  err.should.be.instanceOf(errors.Neo4jTransactionErrors)
  err.errors.should.containDeepOrdered([{code: 'Neo.ClientError.Statement.InvalidSyntax'}])
  should(results).be.undefined()
  done()
})
```

should reject promise with `TransactionAlreadyCommitted` error if transaction is already committed.

```js
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
```

should call callback with `TransactionAlreadyCommitted` error if transaction is already committed.

```js
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
```

should reject promise with `TransactionIsRolledBack` error if transaction was previously rolled back.

```js
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
```

should call callback with `TransactionIsRolledBack` error if transaction was previously rolled back.

```js
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
```

should reject promise with `UnauthorizedAccess` error if Neo4j response statusCode is 401.

```js
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
```

should call callback with `UnauthorizedAccess` error if Neo4j response statusCode is 401.

```js
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
```

results are parsed if `options.parseResult` is truthy.

```js
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
```

<a name="transaction-instance-extendcallback"></a>
## .extend([callback])
should throw if passed a truthy `callback` parameter which is not a function.

```js
function callWithBadParameter () {
  var tx = new Transaction(transactionOptions)
  tx.extend(42)
}
;(callWithBadParameter).should.throw('Method .extend([callback]) expects `callback` to be a function')
```

should return a promise if not passing a callback.

```js
var tx = new Transaction(transactionOptions)
tx.extend().should.be.a.Promise()
```

should **NOT** return a promise if passing a callback.

```js
var tx = new Transaction(transactionOptions)
should(tx.extend(function () {})).not.be.a.Promise()
```

calls transaction.transact with an empty array and the callback function if provided.

```js
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
```

should update transaction expiration date on every call.

```js
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
```

should reject promise with `TransactionAlreadyCommitted` error if transaction is already committed.

```js
var tx = new Transaction(transactionOptions)
tx.commit([
  tx.stmt('CREATE (n:TestNode) SET n.name ="testContent" RETURN n')
])
.then(function () {
  return tx.extend()
})
.catch(errors.TransactionAlreadyCommitted, function () { done() })
.catch(done)
```

should call callback with `TransactionAlreadyCommitted` error if transaction is already committed.

```js
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
```

should reject promise with `TransactionIsRolledBack` error if transaction is already rolledback.

```js
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
```

should call callback with `TransactionIsRolledBack` error if transaction is already rolledback.

```js
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
```

<a name="transaction-instance-rollbackcallback"></a>
## .rollback([callback])
should throw if passed a truthy `callback` parameter which is not a function.

```js
function callWithBadParameter () {
  var tx = new Transaction(transactionOptions)
  tx.rollback(42)
}
;(callWithBadParameter).should.throw('Method .rollback([callback]) expects `callback` to be a function')
```

should return a promise if not passing a callback.

```js
var tx = new Transaction(transactionOptions)
tx.transact()
.then(function () {
  var ret = tx.rollback()
  ret.should.be.Promise()
  return ret
})
.then(function () { done() })
.catch(done)
```

should **NOT** return a promise if passing a callback.

```js
var tx = new Transaction(transactionOptions)
tx.transact([], function (err) {
  if (err) return done(err)
  should(tx.rollback(function () {})).not.be.a.Promise()
  done()
})
```

should rollback an active transaction.

```js
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
```

should reject promise with `TransactionAlreadyCommitted` error if transaction is already committed.

```js
var tx = new Transaction(transactionOptions)
tx.commit([
  tx.stmt('CREATE (n:TestNode) SET n.name ="testContent" RETURN n')
])
.then(function () {
  return tx.rollback()
})
.catch(errors.TransactionAlreadyCommitted, function () { done() })
.catch(done)
```

should call callback with `TransactionAlreadyCommitted` error if transaction is already committed.

```js
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
```

should reject promise with `TransactionIsRolledBack` error if transaction is already rolledback.

```js
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
```

should call callback with `TransactionIsRolledBack` error if transaction is already rolledback.

```js
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
```

should reject promise with `TransactionInactive` error if transaction is not active.

```js
var tx = new Transaction(transactionOptions)
tx.rollback()
.then(function () { done('should reject promise with `TransactionInactive` error') })
.catch(errors.TransactionInactive, function () { done() })
.catch(done)
```

