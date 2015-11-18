# Errors

The neo4j-transactions library has its own set of errors.

This way you can *discriminate* by error while catching rejection of promises returned by transactions methods.

The errors constructors are exposed by the module, the instances of [Client](client.md) and those of [Transaction](transaction.md)
```javascript
var Neo4j = require('neo4j-transactions')
var client = Neo4j()
var tx = client.transaction()

console.log(Neo4j.DatabaseUnavaliable === client.DatabaseUnavaliable) // -> true
console.log(client.DatabaseUnavaliable === tx.DatabaseUnavaliable) // -> true
```

Both Client and Transaction instances are Event Emitters.
They propagate their errors to subscribers through the emission of `error` events.

The client also propagates the errors of child transactions through the emission of `tx:error` events. See [Client docs](client.md)

## `DatabaseUnavaliable`
It's generated whenever a call to database, by a client or a transaction object, fails because of database unavaliability

## `UnauthorizedAccess`
It's generated whenever a transaction operation fails because the database did't authorize it

## `Neo4jTransactionErrors`
It's generated whenever a transaction operation fails because the statements composing the operation produced errors

## `TransactionAlreadyCommitted`
It's generated if you call `transact()` `commit()` `extend()` or `rollback()` on a transaction which was previously committed.

## `TransactionIsRolledBack`
It's generated if you call `transact()` `commit()` `extend()` or `rollback()` on a transaction which was previously rolled back.

## `TransactionInactive`
It's generated if you call `rollback()` on a transaction which is not active, aka: didn't complete a first `transact()` or `extend()` call