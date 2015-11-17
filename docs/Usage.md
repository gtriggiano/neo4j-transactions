# Install

```bash
npm install neo4j-transactions --save
```

# Create a client instance
```javascript
var Neo4j = require('neo4j-transactions')
var neo4jClient = Neo4j({
  url: 'http://localhost:7474'
})
```