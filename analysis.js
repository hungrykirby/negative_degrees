var kuromoji = require('kuromoji');
var builder = kuromoji.builder({
  dicPath: 'node_modules/kuromoji/dict'
});
var fs = require('fs');

var analyze_sentence = function(sentence){
  console.log('sentence' + sentence + 's');
  return new Promise(function(resolve, reject){
    if(sentence === '' || sentence === undefined) resolve(0);
    builder.build(function(err, tokenizer) {
      if(err) { throw err; }
      var tokens = tokenizer.tokenize(sentence);
      var sum = 0;
      var count = 0;
      for(var i = 0; i < tokens.length; i++){
        var form = tokens[i].basic_form;
        switch(tokens[i].pos){
          case "動詞":
          degree = get_degrees('verb', tokens[i]);
          if(degree !== -1){
            sum += (Number(degree) + 1)/2.0;
            count++;
          }
          break;

          case "形容詞":
          degree = get_degrees('adj', tokens[i]);
          if(degree !== -1){
            sum += (Number(degree) + 1)/2.0;
            count++;
          }
          break;

          case "副詞":
          degree = get_degrees('adverb', tokens[i]);
          if(degree !== -1){
            sum += (Number(degree) + 1)/2.0;
            count++;
          }
          break;

          case "名詞":
          degree = get_degrees('noun', tokens[i]);
          if(degree !== -1){
            sum += (Number(degree) + 1)/2.0;
            count++;
          }
          break;

          default:
          degree = get_degrees('out', tokens[i]);
          if(degree !== -1){
            sum += (Number(degree) + 1)/2.0;
            count++;
          }
          break;
        }
        console.log(tokens[i].basic_form + ':' + (Number(degree) + 1)/2.0 + ':' + count);
      }
      if(count !== 0){
        //console.log(sum/count);
        resolve(sum/count);
      }else{
        //console.log(0);
        resolve(0);
      }
    }); //builder
  }); //promise
}; //analysis_sentence


function get_degrees(fileName, token){
  var out = fs.readFileSync('./txt/' + fileName + '.csv' , 'utf8');
  var tmp = out.split('\n');
  var returnNum = -1;
  for(var j = 0; j < tmp.length; j++){
    var splitData = tmp[j].split(',');
    if(token.basic_form == splitData[0]){
      returnNum = splitData[3];
    }
  }
  return Number(returnNum);
}

exports.analyze_sentence = analyze_sentence;
