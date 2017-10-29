const google = require('googleapis')

function GoogleCalendarClient(auth) {
  this.auth = auth
  this.calendar = google.calendar('v3')
}

GoogleCalendarClient.prototype.clearPrimaryCalendar = async function() {
  const client = this
  return new Promise((fulfill, reject) => {
    this.calendar.calendars.clear({
      auth: client.auth,
      calendarId: 'primary'
    }, (err, response) => {
      if (err) {
        reject(err)
      } else {
        fulfill(response)
      }
    })
  })
}

GoogleCalendarClient.prototype.addEventToPrimaryCalendar = async function(event) {
  const client = this
  return new Promise((fulfill, reject) => {
    this.calendar.events.insert({
      auth: client.auth,
      calendarId: 'primary',
      resource: event
    }, (err, response) => {
      if (err) {
        reject(err)
      } else {
        fulfill(response)
      }
    })
  })
}

module.exports = GoogleCalendarClient
