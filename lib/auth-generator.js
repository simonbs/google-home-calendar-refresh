const path = require('path')
const GoogleAuthClient = require('./google-auth-client')
const GoogleCalendarClient = require('./google-calendar-client')

module.exports = {
  generateToken: async function() {    
    return await authClient().getAuth()
  },
  removeToken: function() {
    authClient().removeToken()
  }
}

function authClient() {
  const clientSecretPath = path.resolve(__dirname, '../google-client-secret.json')
  const tokenPath = path.resolve(__dirname, '../google-auth-token.json')
  const scopes = [ 'https://www.googleapis.com/auth/calendar' ]
  return new GoogleAuthClient(clientSecretPath, tokenPath, scopes)  
}