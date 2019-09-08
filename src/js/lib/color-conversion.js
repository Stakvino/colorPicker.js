const helper = require('./lib/helper.js');
const round = helper.round;

function rgbToHsl(array){
  if(array[0] === array[1] && array[1] === array[2]){
    const Lightness = Math.round( array[0] * 100 / 255 );
    return [0, 0, Lightness];
  }
  const norml = array.map( e => e/255 );
  const red   = norml[0];
  const green = norml[1];
  const blue  = norml[2];
  
  const min = Math.min(...norml);
  const max = Math.max(...norml);
  const delta = max - min;

  let hue = 0;
  if(red === max){
    hue = (green - blue) / delta;
    hue %= 6;
  }
  else if(green === max){
    hue = 2 + (blue - red) / delta;
  }
  else if(blue === max){
    hue = 4 + (red - green) / delta;
  }
  
  let Lightness = (min + max)/2;
  
  let saturation = 0;
  if(delta !== 0){
    saturation = delta / (1 - Math.abs(2 * Lightness - 1) );
  }
  
  hue =  Math.round( hue * 60 );
  if(hue < 0){
    hue = 360 + hue;
  }
  saturation = round(saturation * 100);
  Lightness  = round(Lightness * 100);
  
  return [hue, saturation, Lightness];
}
function rgbToHex(array){
  return array.map( e => {
    let hex = e.toString(16);
    if(hex.length === 1){
      hex = "0" + hex;
    }
    return hex;
  });
}
/*************************************************/
function hslToRgb(array){
  const hue = array[0];
  const saturation = array[1]/100;
  const lightness = array[2]/100;
  
  //interm. variables to help calculate the final result
  const C = (1 - Math.abs( (2 * lightness) - 1) ) * saturation;
  const X = C * (1 - Math.abs( (hue / 60)%2 - 1) );
  const m = lightness - (C / 2);
  
  let red = null;
  let green = null;
  let blue  = null;
  
  if(hue >= 0 && hue < 60){
    [red, green, blue] = [C, X, 0];
  }
  else if(hue >= 60 && hue < 120){
    [red, green, blue] = [X, C, 0];
  }
  else if(hue >= 120 && hue < 180){
    [red, green, blue] = [0, C, X];
  }
  else if(hue >= 180 && hue < 240){
    [red, green, blue] = [0, X, C];
  }
  else if(hue >= 240 && hue < 300){
    [red, green, blue] = [X, 0, C];
  }
  else if(hue >= 300 && hue < 360){
    [red, green, blue] = [C, 0, X];
  }
  
  [red, green, blue] = [(red + m) * 255, (green + m) * 255, (blue + m) * 255];
  [red, green, blue] = [red, green, blue].map( e => Math.round(e) )
  
  
  return [red, green, blue];
}

function hslToHex(array){
  return rgbToHex( hslToRgb(array) );
}
/*************************************************/
function hexToRgb(array){
  return array.map( e => parseInt(e, 16) );
}
function hexToHsl(array){
  return rgbToHsl( hexToRgb(array) ); 
}
/*************************************************/
module.exports = {
  rgbToHsl : rgbToHsl,
  rgbToHex : rgbToHex,
  hslToRgb : hslToRgb,
  hslToHex : hslToHex,
  hexToRgb : hexToRgb,
  hexToHsl : hexToHsl
};