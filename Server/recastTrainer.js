const fs = require("fs");
const csv = require('csvtojson');
const services = require('./RecastFunctions');
const { USER_SLUG, BOT_SLUG } = require('./app.config');

const action = (filepath) => {
  csv()
    .fromFile(filepath)
    .then((trainingData) => {
      console.log(JSON.stringify(trainingData));
      services.CreateIntent(USER_SLUG, BOT_SLUG, content[0], content[1], JSON.stringify(element));
    });
};

module.exports = { action };
