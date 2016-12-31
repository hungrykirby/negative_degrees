var Twitter = require('twitter');
var analysis = require('./analysis');
var database = require('./database');

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
      count: 50,
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

var show_tweets = function(tweets){
  var promises = [];
  for (var i = 0; i < tweets.length; i++) {
    promises.push(show_tweet(tweets[i]));
  }
  Promise.all(promises)
    .then(function (results) {
      console.log(results);
  });
};

var show_tweet = function(tweet){
  return new Promise(function(resolve, reject){
    console.log(tweet.text);
    resolve(tweet);
  });
};

var analysis_tweets = function(tweets){
  return new Promise(function(resolve, reject){
    var promises = [];
    var negative_degrees = 0.0;
    var count = 0;
    for (var i = 0; i < tweets.length; i++) {
      promises.push(analysis_tweet(tweets[i]));
    }
    Promise.all(promises)
      .then(function (results) {
        console.log('results', results);
        results.map(function(result){
          console.log('result', result);
          negative_degrees += result;
          count++;
        });
      }).then(function(){
        if(count !== 0){
          resolve(negative_degrees/count);
        }else{
          resolve(0);
        }
      });

    });
};

var analysis_tweet = function(tweet){
  console.log('tweet', tweet.text);
  return new Promise(function(resolve, reject){
    analysis.analyze_sentence(tweet.text).then(function(data){
      resolve(data);
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
  		/*var msg = {
        status: '@' + id + ' ' + text,
      };
  		twitter.post('statuses/update', msg, function(error, tweet, response) {
  			console.log(tweet.text);
  		});*/
      if(/*text = '診断して'*/true){
        console.log('id', id);
        get_tweets(id)
          .then(analysis_tweets)
          .then(function(result){
            //console.log('streamng', result);
            var msg = {
              status: '@' + id + ' '
                    + 'あなたのツイートから分析したネガティブ度合い(0から1までの値)は'
                    + result
                    + 'です。'
                    + 'どう感じますか？'
                    + '自分の予想より高いと思う場合には「高い」、逆なら「低い」と教えてください',
            };
            twitter.post('statuses/update', msg, function(error, tweet, response) {
        			console.log(tweet.text);
        		});
            database.post_to_db(result)
          });
      }
  	});
  });
}

var get_reply_name = function(){

};

exports.delete_tweets = delete_tweets;
exports.get_screen_name = get_screen_name;
exports.get_tweets = get_tweets;
exports.streaming = streaming;
