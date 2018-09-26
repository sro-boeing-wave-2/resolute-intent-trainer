var fs = require("fs");
const services = require('./RecastFunctions');
const { USER_SLUG, BOT_SLUG } =
  require('./app.config');

exports.action = function () {
  var content = fs.readFileSync('./Data/TrainingData.json', 'utf8');
  var jsonContent = JSON.parse(content);
  for (i = 0; i < jsonContent.length; i++) {
    element = jsonContent[i];    
    services.CreateIntent(USER_SLUG, BOT_SLUG, element.intent, element.description, element.expressions);
  };
}

