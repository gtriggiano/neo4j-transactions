# Api Documentation

## Client factory

The module exports a factory function to produce Neo4j Transaction clients.
The function takes an optional `options` parameter to configure the client.
```javascript
var Neo4j = require('neo4j-transactions')
var neo4jClient = Neo4j(options)
```

#### `options` keys:

| key | Default value | Description |
| ---- | ---- | ---- |
| `url` | http://localhost:7474 | The url of the database up to the port. |
| `timeout` | 5000 | The connection timeout of the calls to database. It's passed to [Wreck](https://github.com/hapijs/wreck)|
| `connectionAttempts` | 30 | The number of retries the client attempts to connect to the database. See [Client docs](client.md). |
| `parseResults` | `true` | Whether the child transactions should parse the results of the transactions statements. See [Transaction docs](transaction.md). |
| `credentials` | `undefined` | An object with both a `username` and a `password` property. Ex: ```{username: 'neo4j', password: 'mypass'}```  |

The produced `neo4jClient` is an instance of [Client](client.md)

## Errors constructors
The module exports also the list of errors constructor used by the library.

See [Errors](errors.md)