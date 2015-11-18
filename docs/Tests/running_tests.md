# Running tests

#### Clone the repository
```bash
$ git clone https://github.com/gtriggiano/neo4j-transactions.git
```

#### Install dependencies
```bash
$ cd neo4j-transactions
$ npm install
```

#### Ensure Neo4j is running

The tests suites expect to connect to a Neo4j database running reachable at `http://localhost:7474` and auth protected with **user**: neo4j **password**: test

To simplify life, the library contains a script to download Neo4j Community v.2.3.0 and configure it with the right credentials.
```bash
$ npm run downloadNeo4j

# This command will download Neo4j in a /neo4j folder in the root of the repository
# and will configure it to accept the following credentials
#       username: neo4j
#       password: test


# The library also provides a command to start the downloaded database in console mode
$ npm run startNeo4j
```

#### Run tests
```bash
$ npm run test
```