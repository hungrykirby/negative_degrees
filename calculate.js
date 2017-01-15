exports.calc1 = function(value){
  let result = 0;
  const index = [0, -0.927, 24.59, -46.7, -11.75, 86.67, -38.1, -36.8, 24];
  for(let i = 0; i < index.length; i++){
    result += index[i]*Math.pow(value, i);
  }
  //console.log("clamp", ofClamp(value, 1, 0));
  return ofClamp(result, 1, 0);
}

function ofClamp(value, max, min){
  result = value;
  if(value > max){
    result = max;
  }
  if(value < min){
    result = min;
  }
  return result;
}
