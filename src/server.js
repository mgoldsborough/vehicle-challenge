const express = require('express');
const searchRoute = require('./search.route');
const checkParams = require('./middlewares');

// converted csv to json obviating the need for a DB.
// in the real-world, this would be a DB "select * where ..." call
const sampleData = require('../vehicle_events_data.json');

/*
  EXAMPLE EVENT
  {
    id: 93,
    timestamp: '2023-12-13 20:47:00',
    vehicleId: 'sprint-5',
    event: 'running'
  }
*/

// Configure express
const app = express();
const port = 3000;

app.use(express.json());

// ensure POST params are valid
app.use(checkParams);

// add the search route
app.use(searchRoute(sampleData));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});