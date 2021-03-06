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
        'RETURN post'
    ], {postId: 42})
])
.then(results => {
    if (!results[0].length) throw new Error('User not found')
    if (!results[1].length) throw new Error('Post not found')
    tx.commit([
        tx.stmt( // stmt is a short alias for statement
            `MATCH (post:Post)
            WHERE post._id = {postId}
            WITH post
            MATCH (author:User)
            WHERE author._id = {authorId}
            CREATE (comment:Comment)
            SET comment = {comment}
            SET comment.createdAt = TIMESTAMP()
            CREATE (post)<-[:COMMENTS]-(comment)
            CREATE (comment)<-[:WROTE]-(author)
            RETURN comment, author`,
            {authorId: 'xyz', postId: 42, comment: {text: 'Good post!'}}
        )
    ])
})
.then(results => {
    var result = results[0]
    console.log(result.comment) // {text: "Good post!", createdAt: 123456789}
    console.log(result.author) // {_id: "xyz", name: "..."}
    null
})
.catch(e => {
    console.log(e.message)
    tx.rollback().catch(function () {})
})
```
