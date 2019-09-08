function round(number){
  const integer = parseInt(number);
  const fractional = Number( (number - integer).toFixed(2) );
  if(fractional < 0.35){
    return integer;
  }
  else if(fractional >= 0.35 && fractional <= 0.65){
    return integer + 0.5;
  }
  else{
    return integer + 1; 
  }
}

function throttled(delay, fn) {
  let lastCall = 0;
  return function (...args) {
    const now = (new Date).getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  }
}

module.exports = {
  round : round,
  throttled : throttled
};