const kuromoji = require('kuromoji');
const builder = kuromoji.builder({
  dicPath: 'node_modules/kuromoji/dict'
});
const fs = require('fs');

let verbArr = [];
let adjArr = [];
let adverbArr = [];
let nounArr = [];
let outArr =[];

var txtToArr = function(filename){
  return new Promise(function(resolve, reject){
    let data = fs.readFileSync(filename, 'utf-8');
    let tmp = [];
    tmp = data.split('\r\n');
    let returnArr = [];
    let count = 0;
    for(var i = 0; i < tmp.length; i++){
      let splitData = tmp[i].split(':');
      if(splitData !== ''){
        returnArr[i] = splitData;
        count++;
      }
    }
    //console.log(count);
    resolve({
      arr: returnArr,
      count: count,
    });
  });
};

txtToArr('./dict/pn_ja_utf8.dic')
  .then(function(data){
    let vCount = 0;
    console.log(vCount);
    for(var i = 0; i < data.arr.length; i++){
      if(data.arr[i][2] === '動詞'){
        verbArr.push(data.arr[i]);
      }
      if(data.arr[i][2] === '形容詞'){
        adjArr.push(data.arr[i]);
      }
      if(data.arr[i][2] === '副詞'){
        adverbArr.push(data.arr[i]);
      }
      if(data.arr[i][2] === '名詞'){
        nounArr.push(data.arr[i]);
      }
      if(data.arr[i][2] === '助動詞'){
        outArr.push(data.arr[i]);
      }
    }
  }
);


var analyze_sentence = function(sentence){
  return new Promise(function(resolve, reject){
    if(sentence === '' || sentence === undefined) resolve(0);
    builder.build(function(err, tokenizer) {
      if(err) { throw err; }
      var tokens = tokenizer.tokenize(sentence);
      let degree = 0;
      var sum = 0;
      var count = 0;
      for(var i = 0; i < tokens.length; i++){
        degree = get_degree(tokens[i]);
        if(degree !== -1){
          sum = sum + (degree + 1)/2.0;
          count++;
        }
        console.log(tokens[i].basic_form + ':' + (Number(degree) + 1)/2.0 + ':' + count);
      }
      if(count !== 0){
        resolve(sum/count);
      }else{
        resolve(0);
      }
    }); //builder
  }); //promise
}; //analysis_sentence


function get_degree(token){
  let degree = -1;
  let arr = [];
  switch(token.pos){
    case "動詞":
      arr = verbArr;
    break;

    case "形容詞":
      arr = adjArr;
    break;

    case "副詞":
      arr = adverbArr;
    break;

    case "名詞":
      arr = nounArr;
    break;

    default:
      arr = outArr;
    break;
  }
  for(const a of arr){
    if(token.basic_form === a[1]){
      degree = a[3];
    }
  }
  return Number(degree);
}
exports.analyze_sentence = analyze_sentence;
