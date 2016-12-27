var Twitter = require('twitter');

var twitter = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.OAUTH_TOKEN,
    access_token_secret: process.env.OAUTH_TOKEN_SECRET,
});

var get_screen_name = function(){
  return new Promise(function(resolve, reject){
    twitter.get('account/settings', function(error, data, res){
      //console.log(data);
      if(!error){
        //console.log(data);
        resolve(data.screen_name);
      }
    });
  });
};

var get_tweets = function(screen_name){
  return new Promise(function(resolve, reject){
    var params = {
      count: 100,
      screen_name: screen_name,
    };
    twitter.get('statuses/user_timeline', params, function (error, tweets, response) {
      if (!error) {
        //console.log(tweets);
        resolve(tweets);
      }
    });
  });
};

var delete_tweets = function(tweets){
  var promises = [];
  for (var i = 0; i < tweets.length; i++) {
    promises.push(delete_tweet(tweets[i]));
  }
  Promise.all(promises)
    .then(function (results) {
      console.log(results);
  });
};

var delete_tweet = function(tweet){
  return new Promise(function(resolve, reject){
    /*var params = {
      id: tweet.id,
    };*/
    //console.log(tweet.id_str);
    twitter.post('statuses/destroy', {id: tweet.id_str}, function(error, data){
      console.log(tweet.id_str);
      console.log(data);
      if(!error){
        //console.log(data);
        resolve(data);
      }
    });
  });
};

var streaming = function(bot_id){
  twitter.stream('user', function(stream) {
  	stream.on('data', function(data) {
      //console.log(bot_id);
      var id = '';
      var text = '';
      var ifMention = true;
      try{
        id        = ('user' in data && 'screen_name' in data.user) ? data.user.screen_name : null;
    		text      = ('text' in data) ? data.text.replace(new RegExp('^@' + bot_id + ' '), '') : '';
    		ifMention = ('in_reply_to_user_id' in data) ? (data.in_reply_to_user_id !== null) : false;
      }catch(e){
        console.log('e');
        console.log(e.message);
      }

  		if (!ifMention || id == bot_id) return;
  		var msg = {
        status: '@' + id + ' ' + text,
      };
      //console.log(msg);
  		twitter.post('statuses/update', msg, function(error, tweet, response) {
  			console.log(tweet.text);
  		});
      get_tweets(id).then(function(tweets){ //must mudufy to look at each tweet
        console.log(tweets.text);
      });
  	});
  });
}

var get_reply_name = function(){

};

exports.delete_tweets = delete_tweets;
exports.get_screen_name = get_screen_name;
exports.get_tweets = get_tweets;
exports.streaming = streaming;
