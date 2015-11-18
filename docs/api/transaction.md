# Transaction
```javascript
var Neo4j = require('neo4j-transactions')
var client = Neo4j(options)
var tx = client.transaction()
```

## Api

### Methods

#### A note about promises
Many of the following methods return **[bluebird](http://bluebirdjs.com/docs/getting-started.html) promises**.

_If working with callbacks is more your thing [I hope not :)] you can pass an `callback` function to them. **In this case the method will not generate nor return any promise**_.

Promises are a powerful approach to async workflows and routines.
Moreover bluebird promises let you `catch` them *discriminating* by error constructor. Error constructors are widely exposed by the library, see [Errors](errors.md).

Example:
```javascript
var Neo4j = require('neo4j-transactions')

// Let's simulate a database unavaliability
var client = Neo4j({url: 'http://not.existing:7474'})

var tx = client.transaction()

tx.commit([
  tx.stmt('MATCH (n) RETURN n')
])
.then(function(results) {
  // We will never reach this point
})
.catch(tx.UnauthorizedAccess, function(e) {
  // We will never reach this point
})
.catch(tx.DatabaseUnavaliable, function(e) {
  console.log(e instanceof tx.DatabaseUnavaliable) // -> true
  // Deal with the error...
})
.catch(function(e) {
  // We will never reach this point
})
```

#### `tx.transact(statements, [callback])` -> [Promise]

#### `tx.commit(statements, [callback])` -> [Promise]

#### `tx.extend([callback])` -> [Promise]

#### `tx.rollback([callback])` -> [Promise]

#### `tx.statement(query, [parameters])` -> [Object] Statement

#### `tx.stmt(query, [parameters])` -> [Object] Statement