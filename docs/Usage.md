# Install

```bash
npm install neo4j-transactions --save
```

## Create a client instance
```javascript
var Neo4j = require('neo4j-transactions')
var neo4jClient = Neo4j({
  url: 'http://localhost:7474'
})
```
Here you see just the `url` options. For the complete list see the api docs.

## Create a transaction instance
```javascript
var tx = neo4jClient.transaction()
```

## Use the transaction api
```javascript
tx.transact([
    tx.statement('MATCH (n) RETURN n')
    tx.statement([
        'MATCH (post:Post)',
        'WHERE post._id = {postId}',
        'OPTIONAL MATCH (post)<-[:COMMENTS]-(comment:Comment)',
        'RETURN post, COLLECT(comment) as comments'
    ], {postId: 42})
])
```
