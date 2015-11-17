# Neo4j Transactions
Javascript driver for executing Neo4j transactions calling the [transactional Cypher HTTP endpoint](http://neo4j.com/docs/stable/rest-api-transactional.html).

Works with a promises based* or a callback based code style. The choice is up to you.

## Install
```bash
npm install neo4j-transactions --save
```

## Example
```javascript
var Neo4j = require('neo4j-transactions')

// Create a Neo4j client instance
var neo4jClient = Neo4j({
  url: 'http://localhost:7474'
})

// Create a transaction object
var tx = neo4jClient.transaction()

var newPost = {
  title: 'neo4j-transactions is a tiny library',
  slug: 'neo4j-transactions-is-a-tiny-library'
}

// Execute a transaction which immediately commits
tx.commit([
  tx.statement([
    'CREATE (post:Post)',
    'SET post = {postData}',
    'RETURN post'
  ], {postData: newPost})
])
.then(function (results) {
  // 'results' is an array of responses to the statements passed to tx.commit
  console.log(results[0].post)
  //  {
  //    title: "neo4j-transactions is a tiny library"
  //    slug: "neo4j-transactions-is-a-tiny-library"
  //  }
})
.catch(function (e) {
  console.error(e)
  console.log('Something went wrong.')
})
```

## Documentation
