var utils = require('./twit_utils');

utils.get_screen_name()
  .then(utils.get_tweets)
  .then(utils.delete_tweets);
