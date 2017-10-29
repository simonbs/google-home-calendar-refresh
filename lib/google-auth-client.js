const fs = require('fs')
const readline = require('readline')
const google = require('googleapis')
const googleAuth = require('google-auth-library')

function GoogleAuthClient(clientSecretPath, tokenPath, scopes) {
  this.clientSecretPath = clientSecretPath
  this.scopes = scopes
  this.tokenDir
  this.tokenPath = tokenPath
}

GoogleAuthClient.prototype.getAuth = function(call) {
  const client = this
  return new Promise((fulfill, reject) => {
    fs.readFile(this.clientSecretPath, function processClientSecrets(err, content) {
      if (err) {
        return reject(new Error('Error loading client secret file: ' + err))
      }
      // Authorize a client with the loaded credentials, then call the
      // Google Calendar API.
      client.authorize(JSON.parse(content), (err, auth) => {
        if (err) {
          reject(err)
        } else {
          fulfill(auth)
        }
      })
    })
  })
}

GoogleAuthClient.prototype.authorize = function(credentials, callback) {
  var clientSecret = credentials.installed.client_secret
  var clientId = credentials.installed.client_id
  var redirectUrl = credentials.installed.redirect_uris[0]
  var auth = new googleAuth()
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)
  // Check if we have previously stored a token.
  const client = this
  fs.readFile(this.tokenPath, function(err, token) {
    if (err) {
      client.getNewToken(oauth2Client, callback)
    } else {
      oauth2Client.credentials = JSON.parse(token)
      callback(null, oauth2Client)
    }
  })
}

GoogleAuthClient.prototype.getNewToken = function(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: this.scopes
  })
  console.log('Authorize this app by visiting this url:\n' + authUrl)
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  const client = this
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close()
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        return callback(new Error('Error while trying to retrieve access token: ' + err))
      }
      oauth2Client.credentials = token
      client.storeToken(token)
      callback(null, oauth2Client)
    })
  })
}

GoogleAuthClient.prototype.storeToken = function(token) {
  const tokenDir = this.tokenDir()
  try {
    fs.mkdirSync(tokenDir)
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err
    }
  }
  fs.writeFileSync(this.tokenPath, JSON.stringify(token))
}

GoogleAuthClient.prototype.removeToken = function() {
  if (fs.existsSync(this.tokenPath)) {
    fs.unlink(this.tokenPath)
  }
}

GoogleAuthClient.prototype.tokenDir = function() {
  return this.tokenPath.substring(0, this.tokenPath.lastIndexOf("/"))
}

module.exports = GoogleAuthClient