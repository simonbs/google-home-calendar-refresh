const fs = require('fs')
const path = require('path')

module.exports = async function() {
  return new Promise((fulfill, reject) => {
    let filePath = path.resolve(__dirname, '../config.json')
    fs.readFile(filePath, function(error, content) {     
      if (error) {
        reject(error)
      } else {
        fulfill(JSON.parse(content))
      }
    })
  })
}