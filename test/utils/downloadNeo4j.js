var http = require('http')
var path = require('path')
var targz = require('tar.gz')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require("fs"));
var rmdir = require('rimraf')
var fsx = require('fs.extra')

var neo4jVersion = process.env.NEO4J_VERSION || '2.3.0'

var neo4jUrl = 'http://dist.neo4j.org/neo4j-community-' + neo4jVersion + '-unix.tar.gz'
var moduleBase = path.resolve(__dirname, '..', '..')
var archiveFile = path.resolve(moduleBase, 'neo4j.tar.gz')
var neo4jDirectory = path.resolve(moduleBase, 'neo4j')
var neo4jAuthFileSource = path.resolve(moduleBase, 'test/utils/auth')
var neo4jAuthTargetDir = path.resolve(neo4jDirectory, 'data/dbms')
var neo4jArchiveDirecotry = path.resolve(moduleBase, 'neo4j-community-' + neo4jVersion)

function download(url, dest) {
  return new Promise(function(resolve, reject) {
    var file = fs.createWriteStream(dest)

    http.get(url)
    .on('response', function (res) {
      var len = parseInt(res.headers['content-length'], 10)
      var downloaded = 0

      res
      .on('data', function (chunk) {
        file.write(chunk)
        downloaded += chunk.length
        process.stdout.write('\r\r' + (100 * downloaded / len).toFixed(0) + '% downloaded ')
      })
      .on('end', function () {
        process.stdout.write('\r100% downloaded\n')
        file.end()
        resolve()
      })

    })
    .on('error', function (err) {
      fs.unlink(dest)
      reject(err.message)
    })

  })
}

function rmDirectory(directory) {
  return new Promise(function(resolve, reject) {
    rmdir(directory, function (err) {
      if (err) return reject(err)
      resolve()
    })
  })
}

function mkdirp(directory) {
  return new Promise(function(resolve, reject) {
    fsx.mkdirp(directory, function (err) {
      if (err) return reject(err)
      resolve()
    })
  })
}

function cpFile(source, dest) {
  return new Promise(function(resolve, reject) {
    fsx.copy(source, dest, function (err) {
      if (err) return reject(err)
      resolve()
    })
  })
}

rmDirectory(neo4jDirectory)
.then(function () {
  console.log('Downloading Neo4j ' + neo4jVersion + ' ...')
  return download(neo4jUrl, archiveFile)
})
.then(function () {
  console.log('Extracting')
  return targz().extract(archiveFile, moduleBase)
})
.then(function () {
  console.log('Cleaning')
  return Promise.all([
    fs.unlinkAsync(archiveFile),
    fs.renameAsync(neo4jArchiveDirecotry, neo4jDirectory)
  ])
})
.then(function () {
  console.log('Copying auth file')
  return mkdirp(neo4jAuthTargetDir).then(function () { return cpFile(neo4jAuthFileSource, path.resolve(neo4jAuthTargetDir, 'auth')) })
})
.then(function () {
  console.log('Done!')
})
.catch(function (err) {
  console.log(err)
  process.exit(1)
})
