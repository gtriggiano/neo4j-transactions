# Neo4j Transactions

Neo4j Transactions is a javascript driver for executing transactions on a [Neo4j](http://neo4j.com/) database, calling the [transactional Cypher HTTP endpoint](http://neo4j.com/docs/stable/rest-api-transactional.html).

Works with a promises based or a callback based code style. The choice is up to you.

## Install
```bash
$ npm install neo4j-transactions --save
```

## Quick example
```javascript
var Neo4j = require('neo4j-transactions')

// Create a Neo4j client instance
var client = Neo4j({
  url: 'http://localhost:7474',
  credentials: {
    username: 'neo4j',
    passwrod: 'mypassword'
  }
})

// If you want you can check database avaliability
// before moving on
client.databaseAvaliable
.then(function() {
  // A first call to database was successful
})
.catch(function() {
  // Database is not reachable on the provided url
})

// Create a transaction object
var tx = neo4jClient.transaction()

var newPost = {
  title: 'neo4j-transactions is a tiny library',
  slug: 'neo4j-transactions-is-a-tiny-library'
}

// Execute a transaction which immediately commits
tx.commit([ // commit takes a list of statements
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
  // Something went wrong
})
```

## Api docs
You can read the documentation [in the repository](https://github.com/gtriggiano/neo4j-transactions/tree/master/docs) or on [gitbook.com](https://www.gitbook.com/book/gtriggiano/neo4j-transactions/details), where you can also download the [**PDF**](https://www.gitbook.com/download/pdf/book/gtriggiano/neo4j-transactions), [**ePub**](https://www.gitbook.com/download/epub/book/gtriggiano/neo4j-transactions) and [**MOBI**](https://www.gitbook.com/download/mobi/book/gtriggiano/neo4j-transactions) versions.