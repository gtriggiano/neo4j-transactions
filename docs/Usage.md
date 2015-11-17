# Install

```bash
npm install neo4j-transactions --save
```

## Create a client instance
```javascript
import Neo4j from 'neo4j-transactions'
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
    tx.statement( // ES6
        `MATCH (user:User)
        WHERE user._id = {userId}
        RETURN user`,
        {userId: 'xyz'}
    ),
    tx.statement([ // ES5
        'MATCH (post:Post)',
        'WHERE post._id = {postId}',
        'OPTIONAL MATCH (post)<-[:COMMENTS]-(comment:Comment)',
        'RETURN post, COLLECT(comment) as comments'
    ], {postId: 42}),
    tx.stmt( // stmt is a short alias for statement
        `MATCH (post:Post)
        WHERE post._id = {postId}
        WITH post
        MATCH (user:User)
        WHERE user._id = {authorId}
        CREATE (comment:Comment)
        SET comment = {comment}
        SET comment.createdAt = TIMESTAMP()
        CREATE (post)<-[:COMMENTS]-(comment)
        CREATE (comment)<-[:WROTE]-(user)`,
        {authorId: 'xyz', postId: 42, comment: {text: 'Good post!'}}
    )
])
.then(() {})
```
