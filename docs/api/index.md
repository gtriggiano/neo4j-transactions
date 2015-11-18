# Api Documentation

The module exports a factory function to produce Neo4j Transaction clients.
The function takes an optional `options` parameter to configure the client.
```javascript
var Neo4j = require('neo4j-transactions')
var neo4jClient = Neo4j(options)
```

* [Client](/docs/api/client.md)
* [Transaction](/docs/api/transaction.md)