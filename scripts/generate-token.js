const authGenerator = require('../lib/auth-generator')
authGenerator.removeToken()
authGenerator.generateToken().catch((error) => {
  console.log(error)
})