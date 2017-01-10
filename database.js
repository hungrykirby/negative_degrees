var mongoose = require('mongoose');
var isUserSchemaDefined = false;
var isEvalSchemaDefined = false;
var mode = 'debug';

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

var db_url = process.env.MONGOHQ_URL || 'mongodb://localhost/negativeDegrees4'
if(mode === 'debug'){
  db_url = 'mongodb://localhost/negativeDegrees_tmp'
}
var db = mongoose.createConnection(db_url, options);
db.on("error", console.error.bind(console, "Connection failed..."));
db.once("open", function() {
    console.log("Connected to database...");
});

var Schema   = mongoose.Schema;
var Schema_e = mongoose.Schema;
var UserSchema = new Schema({
  id:  String,
  description: String,
  deg: Number,
  /*tweet_data:[{
    tweets: String,
    degrees: Number,
  }],*/
  tweet_data: [],
});
mongoose.model('User', UserSchema);
var User = db.model('User');
isUserSchemaDefined = true;

var evalSchema = new Schema_e({
  id:  String,
  description: String,
  evaluation: String,
});

mongoose.model('Evaluation', evalSchema);
var Eval = db.model('Evaluation');
isEvalSchemaDefined = true;



exports.post_to_db_tweet_data = function(userid, description, avedegs, tweets, degrees){
  /*db.once("open", function() {
    console.log("Connected to database...");
  });*/

  if(!isUserSchemaDefined){

  }
  //console.log('database', description);
  let arr = [];
  for(let i = 0; i < tweets.length; i++){
    arr[i] = {
      tweets: tweets[i],
      degrees: degrees[i],
    };
  }

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
  user.tweet_data = arr;
  //console.log(user);
  user.save(function(err, data) {
    if (err) {
      console.log('err', err);
    }
    console.log('save done!');
  });
  //db.disconnect();
  //db.close();
};

exports.post_to_db_evaluation = function(userid, description, evaluation){
  /*db.once("open", function() {
    console.log("Connected to database...");
  });*/
  //db.connect('mongodb://localhost/negativeDegrees4', options);

  var user = new Eval();
  user.id = userid;
  user.description = description;
  user.evaluation = evaluation;
  //console.log(evaluation);
  user.save(function(err, data) {
    if (err) {
      console.log('err', err);
    }
    console.log(data);
  });
  //db.disconnect();
  //db.close();
};
