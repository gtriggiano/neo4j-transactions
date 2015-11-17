function DatabaseUnavaliableError (message) {
  this.message = message || 'DatabaseUnavaliable'
  this.name = 'DatabaseUnavaliable'
  Error.captureStackTrace(this, DatabaseUnavaliableError)
}
DatabaseUnavaliableError.prototype = Object.create(Error.prototype)
DatabaseUnavaliableError.prototype.constructor = DatabaseUnavaliableError

function Neo4jTransactionErrorsError (errors) {
  this.message = 'Neo4j rolledback the transaction because of errors'
  this.name = 'Neo4jTransactionErrors'
  this.errors = errors
  Error.captureStackTrace(this, Neo4jTransactionErrorsError)
}
Neo4jTransactionErrorsError.prototype = Object.create(Error.prototype)
Neo4jTransactionErrorsError.prototype.constructor = Neo4jTransactionErrorsError

function UnauthorizedAccessError (message) {
  this.message = message || 'UnauthorizedAccess'
  this.name = 'UnauthorizedAccess'
  Error.captureStackTrace(this, UnauthorizedAccessError)
}
UnauthorizedAccessError.prototype = Object.create(Error.prototype)
UnauthorizedAccessError.prototype.constructor = UnauthorizedAccessError

function TransactionAlreadyCommittedError (message) {
  this.message = message || 'TransactionAlreadyCommitted'
  this.name = 'TransactionAlreadyCommitted'
  Error.captureStackTrace(this, TransactionAlreadyCommittedError)
}
TransactionAlreadyCommittedError.prototype = Object.create(Error.prototype)
TransactionAlreadyCommittedError.prototype.constructor = TransactionAlreadyCommittedError

function TransactionIsRolledBackError (message) {
  this.message = message || 'TransactionIsRolledBack'
  this.name = 'TransactionIsRolledBack'
  Error.captureStackTrace(this, TransactionIsRolledBackError)
}
TransactionIsRolledBackError.prototype = Object.create(Error.prototype)
TransactionIsRolledBackError.prototype.constructor = TransactionIsRolledBackError

function TransactionInactiveError (message) {
  this.message = message || 'TransactionInactive'
  this.name = 'TransactionIsRolledBack'
  Error.captureStackTrace(this, TransactionInactiveError)
}
TransactionInactiveError.prototype = Object.create(Error.prototype)
TransactionInactiveError.prototype.constructor = TransactionInactiveError

module.exports.DatabaseUnavaliable = DatabaseUnavaliableError
module.exports.Neo4jTransactionErrors = Neo4jTransactionErrorsError
module.exports.UnauthorizedAccess = UnauthorizedAccessError
module.exports.TransactionAlreadyCommitted = TransactionAlreadyCommittedError
module.exports.TransactionIsRolledBack = TransactionIsRolledBackError
module.exports.TransactionInactive = TransactionInactiveError
