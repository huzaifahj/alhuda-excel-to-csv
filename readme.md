# Script to convert Al Huda monthly prayer timetables to CSV format for WordPress plugin

- Expects an input.csv file with all the Al Huda monthly calendars in one CSV (January-December concatenated below each other)
- Expects date in format `01/01/2023` and time in format `6:49`
- Set Ramadan start and end dates in `index.ts` file
- Run `npm run start` to generate an `output.csv` file
- Plugin used in WordPress: https://wordpress.org/plugins/daily-prayer-time-for-mosques/