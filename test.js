const inputText = "かあびいさんはかわいいけどなんとなく好きになれないんだよね";

const readDict = require('./read_dict');

readDict.analyze_sentence(inputText).then(function(result){
  console.log(result);
});
