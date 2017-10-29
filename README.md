# google-home-calendar-refresh

![](https://raw.githubusercontent.com/simonbs/google-home-calendar-refresh/master/icon.png)

Google Assistant, and thereby Google Home, only supports reading calendar events from your primary calendar in Google Calendar. If you have any subscriptions, delegates or multiple accounts these are not supported. This is stated in the Google Home help section under [Supported Calendars](https://support.google.com/googlehome/answer/7029002?hl=en).

This project introduces a workaround. The app will read your calenders as iCal feeds and add the events from the feeds to your primary calendar. By relying on iCal feeds, this works both with other Google calendars as well as iCloud calendars.

⚠️ Before adding events to your calendar, the app will *clear your primary calendar*, mening that all events in the calendar are removed. That means the app assumes that you are not already using your primary calendar but instead are relying on other calendars, e.g. an iCloud calendar for your primary events and another Google calendar for your work calendar. This is done to avoid duplicates.

## Setup

The following will guide you through configuring the app.

### Authenticate with Google Calendar API

The first thing you will need is to enable the Google Calendar API on your Google Account. To enable the API, follow the steps below. The steps can also be found on [Googles Node.js Quickstart guide](https://developers.google.com/google-apps/calendar/quickstart/nodejs).

1. Use [Googles wizard](https://console.developers.google.com/flows/enableapi?apiid=calendar) to create or select a project to turn on the API for.
2. On the *Add credentials to your project page*, click the *Cancel* button.
3. At the top of the page, select the *OAuth consent screen* tab. Select an *Email address*, enter a *Product name* if not already set, and click the *Save* button.
4. Select the application type *Other*, enter a name, and click the *Create* button.
5. Click *OK* to dismiss the resulting dialog.
6. Download the JSON containing your credentials and put it in the root of your repository.
7. Rename the file `google-client-secret.json`. This is important as the app will look for a file with that name in the root of the project.

Next you will need to generate an OAuth token that the app can use to manage your Google Calendar.

1. Start a wizard for generating a token by running `npm run token`.
2. Follow the steps in the wizard.
3. If everything went correctly, you should have a file called `google-auth-token.json` in the root of your project.

### Configuring your calendars

Now you are ready to add the calendars you want to put into your primary calendar. Follow the steps below.

1. Copy `config.default.json` to `config.json`.
2. You will see a sample calendar with no URL. This must be a URL that points to the iCal feed of your calendar. For Google Calendar and iCloud calendars, this can be obtained through their respective web interfaces.
3. It is important that your calendars have *unique names*.

You can add as many calendars as you want to. The two attributes `past_days` and `future_days` specify the amount of days to copy events into the past and into the future. If you leave out either attribute, the app will look indefinitely into either direction in time. Leave out both attributes to copy your entire calendar. This is not recommended.

### Deploying

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

You are now ready to deploy the app. Ensure everything is staged and commited to your git repository. Remember that you just added two files containing credentials and a config file with the URLs to your personal calendars, so you probably don't wnat to push this to any public remotes.

You can deploy to Heroku by pressing the above button or you can deploy manually in whatever way you prefer.

### Configuring tasks

⚠️ This is the moment you will remove all events in your primary calendar. For an explanation, see the top of this readme.

Running `npm run refresh` will refresh your calendar. You probably want to configure this to be run periodically, e.g. every hour. If you have deployed to Heroku, it is recommended that you use Heroku Scheduler to configure this. Otherwise you will probably want to set up a cronjob.

If you used the "Deploy to Heroku" button, the Heroku Scheduler addon is already added but it is not configured. You will need to log into Heroku, navigate to the [Heroku Scheduler dashboard](https://scheduler.heroku.com/dashboard) addon and add a new job that runs `npm run refresh`.
