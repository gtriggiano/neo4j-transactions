# Transaction
```javascript
var Neo4j = require('neo4j-transactions')
var client = Neo4j(options)
var tx = client.transaction()
```

## Api

### Methods

#### `tx.transact(statements, [callback])`

#### `tx.commit(statements, [callback])`

#### `tx.extend([callback])`

#### `tx.rollback([callback])`