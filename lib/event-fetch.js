const ical = require('ical.js')
const request = require('request-promise-native')

module.exports = async function(url) {
  const rawiCal = await request(url)
  const jcalData = ICAL.parse(rawiCal)
  const vcalendar = new ICAL.Component(jcalData)
  return vcalendar.getAllSubcomponents('vevent').map((vevent) => {
    return new ICAL.Event(vevent)
  })
}