const readConfig = require('../lib/read-config')
const icalRefresh = require('../lib/ical-refresh')

main().catch(error => {
  console.log(error)
})

async function main() {
  let config = await readConfig()
  await icalRefresh(config.calendars)  
}

