# Client factory

The module exports a factory function to produce Neo4j Transaction clients.
The function takes an optional `options` parameter to configure the client.
```javascript
var Neo4j = require('neo4j-transactions')
var client = Neo4j(options)
```

#### `options` keys:

| key | Default value | Description |
| ---- | ---- | ---- |
| `url` | http://localhost:7474 | The url of the database up to the port. |
| `timeout` | 5000 | The connection timeout of the calls to database. It's passed to [Wreck](https://github.com/hapijs/wreck)|
| `connectionAttempts` | 30 | The number of retries the client attempts to connect to the database. See below. |
| `parseResults` | `true` | Whether the child transactions should parse the results of the transactions statements. See [Transaction docs](transaction.md). |
| `credentials` | `undefined` | An object with both a `username` and a `password` property. Ex: ```{username: 'neo4j', password: 'mypass'}```  |

The produced `client` is an instance of Client.

# Client


### Properties

#### `client.databaseAvaliable`

### Methods

#### `client.testNeo4jAvaliability([silence], [timesToRepeat])`

#### `client.updateCredentials([username], [password])`

#### `client.transaction()`

### Events

The client is an Event Emitter.

It emits events about
* Database avaliability
* Authorization failures calling the db
* Errors originating from child transactions

#### `DatabaseUnavaliable`
```javascript
client.on('DatabaseUnavaliable', function() {
    //....
}
```
---

#### `DatabaseAvaliable`
```javascript
client.on('DatabaseAvaliable', function() {
    //....
}
```
---

#### `error`
```javascript
client.on('error', function(error) {
    //....
}
```
---
#### `tx:error`
```javascript
client.on('tx:error', function(error) {
    //....
}
```