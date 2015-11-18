# Client

```javascript
var Neo4j = require('neo4j-transactions')
var client = Neo4j(options)
```

## Api

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