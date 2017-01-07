var mongoose = require('mongoose');
var isUserSchemaDefined = false;
var isEvalSchemaDefined = false;

/*var db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection failed..."));
db.once("open", function() {
    console.log("Connected to database...");
});*/

exports.post_to_db_tweet_data = function(userid, description, avedegs, tweets, degrees){
  if(!isUserSchemaDefined){
    var Schema   = mongoose.Schema;
    var UserSchema = new Schema({
      id:  String,
      description: String,
      deg: Number,
      tweet_data:[{
        tweets: String,
        degrees: Number,
      }],
    });
    var options = {
      server:{
        socketOptions:{
          //keepAlive: 0,
          connectTimeoutMS: 10000000,
          socketTimeoutMS: 10000000,
        }
      },
      replset:{
        socketOptions:{
          //keepAlive: 0,
          connectTimeoutMS: 10000000,
          socketTimeoutMS: 10000000,
        }
      }
    };

    mongoose.model('User', UserSchema);
    mongoose.connect('mongodb://localhost/negativeDegrees3', options);
    var User = mongoose.model('User');
    isUserSchemaDefined = true;
  }
  //console.log('database');

  var user = new User();
  user.id = userid;
  user.description = description;
  user.deg = avedegs;
  //console.log(tweets);
  /*for(var i = 0; i < tweets.length; i++){
    //console.log(i);
    user.tweet_data.push({
      tweets: tweets[i],
      degrees: degrees[i],
    });
  }*/
  user.save(function(err) {
    if (err) {
      console.log('err', err);
    }
  });
  //mongoose.disconnect();
};

exports.post_to_db_evaluation = function(userid, description, evaluation){
  if(!isEvalSchemaDefined){
    var Schema   = mongoose.Schema;
    var evalSchema = new Schema({
      id:  String,
      description: String,
      evaluation: String,
    });
    var options = {
      server:{
        socketOptions:{
          //keepAlive: 0,
          connectTimeoutMS: 10000000,
          socketTimeoutMS: 10000000,
        }
      },
      replset:{
        socketOptions:{
          //keepAlive: 0,
          connectTimeoutMS: 10000000,
          socketTimeoutMS: 10000000,
        }
      }
    };


    mongoose.model('Evaluation', evalSchema);
    mongoose.connect('mongodb://localhost/negativeDegrees3');
    var Eval = mongoose.model('Evaluation');
    isEvalSchemaDefined = true;
  }

  var user = new Eval();
  user.id = userid;
  user.description = description;
  user.evaluation = evaluation;
  //console.log(tweets);
  user.save(function(err) {
    if (err) {
      console.log('err', err);
    }
  });
  //mongoose.disconnect();
};
