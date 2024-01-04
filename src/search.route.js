const express = require('express');

/**
 * Converts a UTC string to ms string
 * @param {string} dateString 
 * @returns Time in ms as a string.
 */
function toMilliseconds(dateString) {
  const date = new Date(dateString);
  return date.getTime();
}

// inject the search data.
// in reality, we'd want to inject a datasource
// so we can query it.
module.exports = (sampleData) => {
  const router = express.Router();

  // Define the /search endpoint
  router.post('/search', (req, res) => {
    // assuming these are valid based on the `checkParams` middleware
    const { startDate, endDate, vehicleId } = req.body;

    // convert UTC to milliseconds
    const startMs = toMilliseconds(startDate);
    const endMs = toMilliseconds(endDate);

    // filter and sort data by timestamp
    let sortedData = sampleData
      .filter(event => event.vehicleId === vehicleId)
      .sort((a, b) => toMilliseconds(a.timestamp) - toMilliseconds(b.timestamp));
    
    // requirement: First interval in the response must contain ‘event’ value of the latest event before the startDate
    const latestEventBeforeStartDate = sortedData
      .filter(event => toMilliseconds(event.timestamp) < startMs)
      .pop();

    // requirement: Response must contain at least 1 interval
    // requirement: ‘from’ key of the first interval in the resulting array must be equal to the startDate input param
    let results = [{
      event: latestEventBeforeStartDate ? latestEventBeforeStartDate.event : 'no_data',
      from: startMs,
      to: startMs, // This will be updated as we find the next event
    }];

    // filter the events events within the range and process
    sortedData = sortedData.filter(event =>
      toMilliseconds(event.timestamp) >= startMs &&
      toMilliseconds(event.timestamp) <= endMs
    );

    sortedData.forEach(event => {
      let currentEventMillis = toMilliseconds(event.timestamp);
      let lastInterval = results[results.length - 1];
      
      // requirement: Consecutive similar events must be combined into one interval
      // check here if the current event is different from last, or if there is no 
      // last event, add a new interval
      if (!lastInterval || lastInterval.event !== event.event) {
        // update the 'to' of the last interval if it's not the initial one
        if (lastInterval && lastInterval.event !== 'no_data') {
          lastInterval.to = currentEventMillis;
        }
        
        // add to the list of resulst
        results.push({
          event: event.event,
          from: currentEventMillis,
          to: endMs, // assume it goes to the end until we loop back around
        });
      }
    });

    // requirement: ‘to’ key of the last interval in the resulting array must be equal to the endDate input param
    if (results.length > 0) {
      results[results.length - 1].to = endMs;
    }

    // requirement: If there’s no logged events before the startDate, first interval must contain ‘no_data’ in the ‘event’ field
    if (results.length === 1 && results[0].event === 'no_data') {
      results[0].to = endMs;
    }

    console.log("End search");

    res.json(results);
  });

  return router;
}