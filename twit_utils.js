var Twitter = require('twitter');
var analysis = require('./analysis');
var database = require('./database');
var calc = require('./caluculate')

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
      count: 25,
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
      //console.log(results);
  });
};

var show_tweet = function(tweet){
  return new Promise(function(resolve, reject){
    //console.log(tweet.text);
    resolve(tweet);
  });
};

var analysis_tweets = function(tweets){
  return new Promise(function(resolve, reject){
    var promises = [];
    var negative_degrees = 0.0;
    var count = 0;
    var count_out0 = 0;
    var degree_collection = [];
    var tweet_collection = [];
    for (var i = 0; i < tweets.length; i++) {
      tweet_collection[i] = tweets[i].text;
      var shaped_text = tweets[i].text;
      //shaped_text = weets[i].text.replace(/(https?://[\w/:%#\$&\?\(\)~\.=\+\-]+)/igm, "");
      //shaped_text = tweets[i].text.replace(/@.*\x20/, "");
      shaped_text = shaped_text.replace(/https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+/g, ""); //url
      shaped_text = shaped_text.replace(/@[a-z0-9_]+/g, ""); //リプライを削除
      //shaped_text = shaped_text.replace(/RT:/, ""); //RT
      shaped_text = shaped_text.replace(/診断して/igm, "");
      shaped_text = shaped_text.replace(/[a-zA-Z0-9_]+/g, "");
      shaped_text = shaped_text.replace(/\x20/g, "");
      shaped_text = shaped_text.replace(/[０-９]+/g, "");
      promises.push(analysis_tweet(shaped_text));
    }
    Promise.all(promises)
      .then(function (results) {
        //console.log('results', results);
        results.map(function(result){
          //console.log(result + ',' + negative_degrees + ',' + );
          negative_degrees += result;
          degree_collection[count] = result;
          count++;
          if(result !== 0){
            count_out0++;
            //console.log(count_out0);
          }
        });
      }).then(function(){
        if(count_out0 !== 0){
          resolve({
            'tweets': tweet_collection,
            'degrees': degree_collection,
            'avedegs': negative_degrees/count_out0,
          });
        }else{
          resolve({
            'tweets': tweet_collection,
            'degrees': degree_collection,
            'avedegs': 0,
          });
        }
      });

    });
};

var analysis_tweet = function(tweet_text){
  return new Promise(function(resolve, reject){
    analysis.analyze_sentence(tweet_text).then(function(data){
      console.log(tweet_text + ' ' + data);
      resolve(data);
    });
  });
};

var streaming = function(bot_id){
  //twitter.stream('statuses/filter', {track: '@' + bot_id}, function(stream) {
  twitter.stream('user', function(stream) {
  	stream.on('data', function(data) {
      //console.log(bot_id);
      var id = '';
      var text = '';
      var description = '';
      var ifMention = true;
      try{
        id        = ('user' in data && 'screen_name' in data.user) ? data.user.screen_name : null;
    		text      = ('text' in data) ? data.text.replace(new RegExp('^@' + bot_id + ' '), '') : '';
        description = ('user' in data && 'description' in data.user) ? data.user.description : 'no text';
        ifMention = ('in_reply_to_user_id' in data) ? (data.in_reply_to_user_id !== null) : false;
      }catch(e){
        console.log(e.message);
      }

  		if (!ifMention || id == bot_id) return;
      console.log(text);
  		/*var msg = {
        status: '@' + id + ' ' + text,
      };
  		twitter.post('statuses/update', msg, function(error, tweet, response) {
  			console.log(tweet.text);
  		});*/
      if(text.indexOf('診断して') != -1){
        console.log('id', id);
        get_tweets(id)
          .then(analysis_tweets)
          .then(function(result){
            //console.log('streamng', result);
            var msg = {
              status: '@' + id + ' '
                    + 'あなたのツイートから分析したポジティブ度合いは'
                    + (Math.floor(calc.calc1(result.avedegs)*100.0))
                    + '%です。'
                    + 'どう感じますか？'
                    + '自分の予想より高いと思う場合には「高い」、逆なら「低い」と教えてください。'
                    + 'ぜひRTしてね！ #negatter',
            };
            try{
              twitter.post('statuses/update', msg, function(error, tweet, response) {
        			  console.log(tweet.text);
                console.log('------------------------------');
        		  });
            }catch(e){
              console.log(e.message);
            }

            console.log('result.tweets', result.tweets);
            database.post_to_db_tweet_data(id, description, result.avedegs, result.tweets, result.degrees);
          });
      }
      if(text.indexOf('高い') != -1 || text.indexOf('低い') != -1){
        database.post_to_db_evaluation(id, description, text);
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
