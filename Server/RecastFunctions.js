const { RECAST_AUTHORIZATION } = require('./app.config');
const request = require('superagent');
const http = require('http');

exports.CreateIntent = function (USER_SLUG, BOT_SLUG, NAME, DESCRIPTION, QUERY) {
  request
    .post(`https://api.recast.ai/v2/users/${USER_SLUG}/bots/${BOT_SLUG}/intents`)
    .send({
      name: NAME,
      description: DESCRIPTION,
      expressions: QUERY
    })
    .set('Authorization', RECAST_AUTHORIZATION)
    .end((err, res) => {
      console.log(res.text);
    });
}

exports.AddToIntent = function (USER_SLUG, BOT_SLUG, QUERY, INTENT_SLUG) {

  request
    .post(`https://api.recast.ai/v2/users/${USER_SLUG}/bots/${BOT_SLUG}/intents/${INTENT_SLUG}/expressions`)
    .send({
      source: QUERY,
      language: { isocode: 'en' }
    })
    .set('Authorization', RECAST_AUTHORIZATION)
    .end((err, res) => console.log(res.text));
};
