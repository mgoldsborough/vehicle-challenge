function isValidUTCTimestamp(timestamp) {
  // regex to check if the timestamp is in ISO 8601 format
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
  
  // Check the format first
  if (!regex.test(timestamp)) {
    console.log("INVALID REGEX")
    return false;
  }
  
  // Then check if it's a valid date
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}

function isAfter(startDate, endDate) {
  return new Date(startDate) > new Date(endDate);
}

// validates the POST parameters to the /search method
const checkParams = (req, res, next) => {
  if(!req.body) {
    console.log(`body empty`);
    return res.status(400).json({"error": "Empty body"});
  }
  else if(!req.body.startDate) {
    console.log(`start date empty`);
    return res.status(400).json({"error": "Empty start date"});
  }
  else if(!isValidUTCTimestamp(req.body.startDate)) {
    console.log(`invalid start date ${req.body.startDate}`);
    return res.status(400).json({"error": "Invalid start date"});
  }
  else if(!req.body.endDate) {
    console.log(`end date empty`);
    return res.status(400).json({"error": "Empty end date"});
  }
  else if(!isValidUTCTimestamp(req.body.endDate)) {
    console.log(`invalid end date ${req.body.endDate}`);
    return res.status(400).json({"error": "Invalid end date"});
  }
  else if(isAfter(req.body.startDate, req.body.endDate)) {
    console.log(`start date after end date`);
    return res.status(400).json({"error": "Start date after end date"});
  }
  else if(!req.body.vehicleId) {
    console.log(`vehicle id empty`);
    return res.status(400).json({"error": "Empty vehicle id"});
  }

  return next();
}

module.exports = checkParams;
