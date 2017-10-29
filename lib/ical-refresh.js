const path = require('path')
const eventFetch = require('./event-fetch')
const authGenerator = require('./auth-generator')
const GoogleCalendarClient = require('./google-calendar-client')

module.exports = async function(feeds) {
  let eventsMap = {}
  for (let feed of feeds) {
    const filteredEvents = filter(await eventFetch(feed.url), feed['past_days'], feed['future_days'])
    const mappedEvents = filteredEvents.map(eventToGoogleEvent)
    eventsMap[feed.name] = {}
    eventsMap[feed.name]['events'] = mappedEvents
  }
  const auth = await authGenerator.generateToken()
  const calendar = new GoogleCalendarClient(auth)
  await calendar.clearPrimaryCalendar()
  const feedNames = Object.keys(eventsMap)
  for (let feedName of feedNames) {
    const googleEvents = eventsMap[feedName].events
    for (googleEvent of googleEvents) {
      await calendar.addEventToPrimaryCalendar(googleEvent)
    }
  }
}

function eventToGoogleEvent(event) {
  let result = {
    'summary': event.summary,
    'description': event.description,
    'location': event.location,
    'organizer': {
      'email': stripEmail(event.organizer)
    }
  }
  if (event.startDate.isDate) {
    result['start'] = {
      'date': event.startDate.toString(),
    }
  } else {
    result['start'] = {
      'dateTime': stripDate(event.startDate)
    }
  }
  if (event.endDate.isDate) {
    result['end'] = {
      'date': event.endDate.toString(),
    }
  } else {
    result['end'] = {
      'dateTime': stripDate(event.endDate) 
    }
  }
  result['start']['timeZone'] = getTimezone(event.startDate)
  result['end']['timeZone'] = getTimezone(event.endDate)
  if (event.isRecurring()) {
    result['recurrence'] = event.component.getAllProperties('rrule').map(rrule => {
      return "RRULE:"+rrule.getFirstValue().toString()
    })
  }
  return result
}

function getTimezone(date) {
  if (date.timezone == null || date.toString().endsWith('Z')) {
    return "Zulu"
  } else {
    return date.timezone
  }
}

function stripEmail(email) {
  if (email == null) {
    return email
  }
  let mailtoPrefix = 'mailto:'
  if (email.startsWith(mailtoPrefix)) {
    return email.substring(mailtoPrefix.length, email.length)
  } else {
    return email
  }
}

function stripDate(date) {
  let zSuffix = 'Z'
  let strDate = date.toString()
  if (strDate.endsWith(zSuffix)) {
    return strDate.substring(0, strDate.length - zSuffix.length)
  } else {
    return strDate
  }
}

function partstatToResponseStatus(partstat) {
  if (partstat == 'ACCEPTED') {
    return 'accepted'
  } else if (partstat == 'DECLINED') {
    return 'declined'
  } else if (partstat == 'NEEDS-ACTION') {
    return 'needsAction'
  } else if (partstat == 'TENTATIVE') {
    return 'tentative'
  } else {
    return null
  }
}

function filter(events, pastDays, futureDays) {
  if (pastDays == null && futureDays == null) {
    return events
  }
  const nowTimestamp = new Date().getTime()
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000
  let pastTimestamp = null
  let futureTimestamp = null
  if (pastDays != null) {
    pastTimestamp = nowTimestamp - oneDayInMilliseconds * pastDays
  }
  if (futureDays != null) {
    futureTimestamp = nowTimestamp + oneDayInMilliseconds * futureDays
  }  
  return events.filter(event => {    
    let startDate = findStartDate(event, pastTimestamp)
    if (startDate == null) {
      // We could not get a start date. Probably because a recurrence rule is no longer active.
      return false
    }
    let duration = event.endDate.toJSDate().getTime() - event.startDate.toJSDate().getTime()
    let endDate = new Date(startDate.toJSDate().getTime() + duration)
    let eventStartTimestamp = startDate.toJSDate().getTime()
    let eventEndTimestamp = endDate.getTime()
    let pastAccepts = true
    let futureAccepts = true
    if (pastTimestamp != null) {
      pastAccepts = eventEndTimestamp >= pastTimestamp
    }
    if (futureTimestamp != null) {
      futureAccepts = eventStartTimestamp <= futureTimestamp
    }
    if (!pastAccepts || !futureAccepts) {
      // console.log("! " + event.summary)
      if (event.summary == "Dans") {
        console.log("! " + event.summary)
        console.log("  " + event.startDate)
        console.log("  " + event.endDate)
      }
    }
    return pastAccepts && futureAccepts
  })
}

function findStartDate(event, pastTimestamp) {
  if (event.isRecurring()) {
    if (pastTimestamp != null) {
      // Start iterator at our past time.
      const pastDate = new Date(pastTimestamp)
      return nextStartDateForRecurringEvent(event, event.iterator(), pastTimestamp, pastDate)
    } else {
      return nextStartDateForRecurringEvent(event, event.iterator(), pastTimestamp)
    }
  } else {
    return event.startDate
  }
}

function nextStartDateForRecurringEvent(event, iterator, pastTimestamp) {
  let nextStartDate = iterator.next()    
  if (nextStartDate == null || nextStartDate == undefined) {
    return null
  }
  if (nextStartDate.toJSDate().getTime() >= pastTimestamp) {
    return nextStartDate
  } else {
    return nextStartDateForRecurringEvent(event, iterator, pastTimestamp)
  }
}
