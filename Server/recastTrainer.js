const fs = require("fs");
const csv = require('csvtojson');
const services = require('./RecastFunctions');
const { USER_SLUG, BOT_SLUG } = require('./app.config');

const action = (filepath) => {
  csv()
    .fromFile(filepath)
    .then((trainingData) => {
      console.log(JSON.stringify(trainingData));
      trainingData.forEach((data) => {
        services.CreateIntent(USER_SLUG, BOT_SLUG, data.intent, data.description, JSON.stringify(data.expressions));
      });
    });
};

module.exports = { action };
