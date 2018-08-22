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
class ColorPicker{
  constructor(){
    this.DOM = this.create();
    this.closeButton  = this.DOM.getElementsByClassName("close-but")[0];
    this.cancelButton = this.DOM.getElementsByClassName("cancel-but")[0];
    this.selectButton = this.DOM.getElementsByClassName("select-but")[0];
    /*********************************************************************************/
    this.hueCanvas = this.DOM.getElementsByClassName("hue-canvas")[0];
    this.hueSliderBut = this.DOM.getElementsByClassName("hue-slider-button")[0];
    this.opacityCanvas = this.DOM.getElementsByClassName("opacity-canvas")[0];
    this.opacitySliderBut = this.DOM.getElementsByClassName("opacity-slider-button")[0];
    this.slCanvas = this.DOM.getElementsByClassName("sl-canvas")[0];
    this.slCursor = this.DOM.getElementsByClassName("sl-cursor")[0];
    this.slCtx    = this.slCanvas.getContext("2d");
    /*********************************************************************************/
    this.lastSelectedColorSquare = this.DOM.getElementsByClassName("last-selected-color")[0];
    this.selectedColorSquare = this.DOM.getElementsByClassName("selected-color")[0];
    this.colorCodeInput = this.DOM.getElementsByClassName("color-code")[0];
    
    this.lastSelectedColor = `hsla(0, 0%, 0%, 1)`;
    this.selectedColor = {
      hsla : {
        str   : `hsla(0, 0%, 0%, 1)`,
        array : [0, 0, 0, 1]
      },
      rgba : {
        str   : `rgba(0, 0, 0, 1)`,
        array : [0, 0, 0, 1]
      },
      hex  : {
        str   : `#000000`,
        array : ["00", "00", "00"]
      }
    };
    this.selectedColorCode = "hex";
    /*********************************************************************************/
    this.selectedHue = 0;
    this.selectedSaturation = 0;
    this.selectedLightness = 0;
    this.selectedOpacity = 1;
    /*********************************************************************************/
    this.inputCallbacks  = [];
    this.changeCallbacks = [];
    /*********************************************************************************/
    this.init();
    this.AttachEventHandlers();
  }
  
  get halfSliderSize(){
    return this.hueSliderBut.clientWidth/2;
  } 
  
  get halfSlCursorSize(){
    return this.slCursor.clientWidth/2;
  }
  
}

ColorPicker.prototype.create = function(){
  const colorPicker = document.createElement("div");
  colorPicker.className = "color-picker-js hide";
  colorPicker.innerHTML = `
  <div class="close-block">
  <button type="button" class="close-but">&#x2715;</button>
  </div>
  <div class="main-block">
    <div class="hue-block">
     <canvas width="360" height="20" class="hue-canvas"></canvas>
     <div class="slider-button hue-slider-button"></div>
    </div>
    <div class="selected-colors-block">
      <div class="last-selected-color"></div>
      <div class="selected-color"></div>
    </div>
    <div class="sl-block">
     <canvas width="200" height="200" class="sl-canvas"></canvas>
     <div class="sl-cursor"></div>
    </div>
    <div class="opacity-block">
      <canvas width="20" height="200" class="opacity-canvas transparent-background"></canvas>
      <div class="slider-button opacity-slider-button"></div>
    </div>
    <input type="text" spellcheck="false" class="color-code letter-spacing">
    <div class="conversion-buttons">
      <button type="button" class="selected-color-code" data-code="hex">HEX</button>
      <button type="button" data-code="hsla">HSLA</button>
      <button type="button" data-code="rgba">RGBA</button>
    </div>
    <div class="cancel-select">
      <button type="button" class="cancel-but">Cancel</button>
      <button type="button" class="select-but">Select</button>
    </div>
  </div>`;

  return colorPicker;
}

//initialise the color picker canvas by drawing all values of hue, opacity and saturation/lightness
ColorPicker.prototype.init = function(){
  
  const hueCtx = this.hueCanvas.getContext("2d");
  const hueCanvasWidth  = this.hueCanvas.width;
  const hueCanvasHeight = this.hueCanvas.height;
  //fill the hue canvas with all colors from 0 to 360 degrees
  for(let i = 0;i <= hueCanvasWidth; i++){
    hueCtx.fillStyle = `hsl(${i},100%,50%)`;
    hueCtx.fillRect(i, 0, 1, hueCanvasHeight);
  }
  /***********************************************************************************/
  const opacityCtx = this.opacityCanvas.getContext("2d");
  const opacityCanvasWidth  = this.opacityCanvas.width;
  const opacityCanvasHeight = this.opacityCanvas.height;
  //fill the opacity canvas with values from 0 to 100%
  for(let i = 0;i <= opacityCanvasHeight; i++){
    opacityCtx.fillStyle = `rgba(0,0,0,${i/opacityCanvasHeight})`;
    opacityCtx.fillRect(0, i, opacityCanvasWidth, 2);
  }
  this.fillSlSquare();
  this.fillLastSelectedColorSquare();
  this.fillSelectedColorSquare();
  this.colorCodeInput.value = this.selectedColor.hex.str;
  /***********************************************************************************/
  document.body.appendChild(this.DOM);
  //this.DOM.style.left   = innerWidth/2 - 250 + "px";
  //this.DOM.style.height = innerHeight/2  + "px";
}

ColorPicker.prototype.AttachEventHandlers = function(){
  //close, cancel and select button hide the color picker
  this.closeButton.addEventListener("click", () => {
    const hslaArray = this.lastSelectedColor.split(",").map(e => parseFloat( e.slice(e.match(/\d/).index) ) );
    
    if (this.selectedColor.hsla.str !== this.lastSelectedColor) {
      //return the last selected value because the user didn't select a new one
      this.changeState(...hslaArray);
      for(const callback of this.changeCallbacks){
        callback();
      }
    }
    else{
      this.changeState(...hslaArray);
    }
    this.hide();
  });
  
  this.cancelButton.addEventListener("click", () => {
    const hslaArray = this.lastSelectedColor.split(",").map(e => parseFloat( e.slice(e.match(/\d/).index) ) );
    
    if (this.selectedColor.hsla.str !== this.lastSelectedColor) {
      //return the last selected value because the user didn't select a new one
      this.changeState(...hslaArray);
      for(const callback of this.changeCallbacks){
        callback();
      }
    }
    else{
      this.changeState(...hslaArray);
    }
    this.hide();
  });
  
  this.selectButton.addEventListener("click", () => {
    if (this.selectedColor.hsla.str !== this.lastSelectedColor) {
      this.lastSelectedColor = this.selectedColor.hsla.str;
      this.fillLastSelectedColorSquare();
      for(const callback of this.changeCallbacks){
        callback();
      }
    }
    this.hide();
  });
  /***********************************************************************************/
  let mouseLastPosition = {x : null, y : null};
  
  let mainBlockClicked = false;
  const closeBlock   = this.DOM.getElementsByClassName("close-block")[0];
  const mainBlock   = this.DOM.getElementsByClassName("main-block")[0];
  //drag color picker to change his position in the page
  this.DOM.addEventListener( "mousedown", (e) => {
    if (e.target === closeBlock || e.target === mainBlock) {
      e.preventDefault();
      mouseLastPosition.x = null;
      mouseLastPosition.y = null;
      mainBlockClicked = true;
    }
  });
  addEventListener( "mouseup", () => mainBlockClicked = false );

  addEventListener("mousemove", (e) => {
    if(mainBlockClicked){
      const distanceMoved = {
        x : e.pageX - (mouseLastPosition.x || e.pageX),
        y : e.pageY - (mouseLastPosition.y || e.pageY)
      };

      this.DOM.style.left = `${this.DOM.offsetLeft + distanceMoved.x}px`;
      this.DOM.style.top  = `${this.DOM.offsetTop + distanceMoved.y}px`;

      mouseLastPosition.x = e.pageX;
      mouseLastPosition.y = e.pageY;
    }
  });
  /***********************************************************************************/
  //hue slider event handler
  let hueSliderClicked = false;

  this.hueSliderBut.addEventListener( "mousedown", (e) => {
    e.preventDefault();
    hueSliderClicked = true;
  });
  addEventListener( "mouseup",() => hueSliderClicked = false );

  addEventListener("mousemove", (e) => {
    if(hueSliderClicked){
      const hueCanvasPosition = this.hueCanvas.getClientRects()[0].left;
      const newHueValue = e.pageX - hueCanvasPosition - window.scrollX;
      this.moveHueSlider(newHueValue);
      this.fillSlSquare();
      this.updateSelectedColor();
      this.fillSelectedColorSquare();
    }
  });

  this.hueCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    hueSliderClicked = true;
    const hueCanvasPosition = this.hueCanvas.getClientRects()[0].x;
    const newHueValue = e.pageX - hueCanvasPosition - window.scrollX;
    this.moveHueSlider(newHueValue);
    this.fillSlSquare();
    this.updateSelectedColor();
    this.fillSelectedColorSquare();
  });
  /***********************************************************************************/
  //opacity slider event handler
  let opacitySliderClicked = false;

  this.opacitySliderBut.addEventListener( "mousedown", (e) => {
    e.preventDefault();
    opacitySliderClicked = true;
  });
  addEventListener( "mouseup",() => opacitySliderClicked = false );

  addEventListener("mousemove", (e) => {
    if(opacitySliderClicked){
      const newOpacityValue = (e.pageY - this.opacityCanvas.getClientRects()[0].top - window.scrollY)/200;
      this.moveOpacitySlider(newOpacityValue);
      this.fillSlSquare();
      this.updateSelectedColor();
      this.fillSelectedColorSquare();
    }
  });

  this.opacityCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    opacitySliderClicked = true;
    const newOpacityValue = (e.pageY - this.opacityCanvas.getClientRects()[0].top - window.scrollY)/200;
    this.moveOpacitySlider(newOpacityValue);
    this.fillSlSquare();
    this.updateSelectedColor();
    this.fillSelectedColorSquare();
  });
  /***********************************************************************************/
  //sl cursor event handler
  let slCursorClicked = false;
  this.slCursor.addEventListener("mousedown", () => slCursorClicked = true );
  addEventListener("mouseup", () => slCursorClicked = false );
  //clicking on the sl canvas will change the saturation and lightness of the color and sl canvas cursor position
  this.slCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    slCursorClicked = true;
    
    //change cursor position in sl canvas
    const slCanvasClientRect = this.slCanvas.getClientRects()[0];
    const saturation = (e.pageX - slCanvasClientRect.x - window.scrollX)/2;
    const lightness = 100 - (e.pageY - slCanvasClientRect.y - window.scrollY)/2;
    this.moveSlCursor(saturation, lightness);
    this.updateSelectedColor();
    this.fillSelectedColorSquare();
  });

  addEventListener("mouseup", () => slCanvasClicked = false );

  addEventListener("mousemove", (e) => {
    if(slCursorClicked){
      //change cursor position in sl canvas
      const slCanvasClientRect = this.slCanvas.getClientRects()[0];
      const saturation = (e.pageX - slCanvasClientRect.x - window.scrollX)/2;
      const lightness = 100 - (e.pageY - slCanvasClientRect.y - window.scrollY)/2;
      this.moveSlCursor(saturation, lightness);
      this.updateSelectedColor();
      this.fillSelectedColorSquare();
    }
  
  });
  /***********************************************************************************/
  this.colorCodeInput.addEventListener("input", () => {
    this.setColorFromInput();
    this.fillSlSquare();
    this.fillSelectedColorSquare();
  });
  /***********************************************************************************/
  //choosing a conversion button will highlight it and change the value of this.selectedColorCode
  const conversionButtons = Array.from( this.DOM.getElementsByClassName("conversion-buttons")[0].children );
  
  for(let i = 0; i < conversionButtons.length; i++){
    const button = conversionButtons[i];
    button.addEventListener("click", () => {
      const currentSelected = conversionButtons.filter(but => but.classList.contains("selected-color-code") )[0];
      currentSelected.classList.remove("selected-color-code");
      button.classList.add("selected-color-code");
      this.selectedColorCode = button.dataset.code;
      this.colorCodeInput.value = this.selectedColor[this.selectedColorCode].str;

      if(this.selectedColorCode === "hex"){
        this.colorCodeInput.classList.add("letter-spacing");
      }
      else{
        this.colorCodeInput.classList.remove("letter-spacing");
      }
    });
  }
}
/***********************************************************************************/
ColorPicker.prototype.onInput = function(callback){
  this.inputCallbacks.push(callback);
}
/***********************************************************************************/
ColorPicker.prototype.onChange = function(callback){
  this.changeCallbacks.push(callback);
}
/***********************************************************************************/
ColorPicker.prototype.removeOnInput = function(callback){
  this.inputCallbacks.splice(this.inputCallbacks.indexOf(callback), 1);
}
/***********************************************************************************/
ColorPicker.prototype.removeOnChange = function(callback){
  this.changeCallbacks.splice(this.changeCallbacks.indexOf(callback), 1);
}
/***********************************************************************************/
ColorPicker.prototype.setColorFromHex = function(){
  let value = this.colorCodeInput.value;
  let colorsCodeArray = value.match(/[0-9a-fA-F]/g);

  if(!colorsCodeArray || ( colorsCodeArray.length !== 3 && colorsCodeArray.length !== 6) ){
    return;
  }
  else if(colorsCodeArray.length === 6){
    for(let i = 0; i < colorsCodeArray.length/2; i++){
      colorsCodeArray[i] = colorsCodeArray[i * 2] + colorsCodeArray[ (2 * i) + 1];
    }
    colorsCodeArray = colorsCodeArray.splice(0, 3);
  }
  else if(colorsCodeArray.length === 3){
    //duplicate each element of the array
    colorsCodeArray = colorsCodeArray.map( e => e.repeat(2) );
  }
  
  this.selectedColor.hex.array = colorsCodeArray.slice();
  this.selectedColor.hex.str = "#" + colorsCodeArray.join("");

  this.selectedColor.rgba.array = hexToRgb(this.selectedColor.hex.array);
  const red = this.selectedColor.rgba.array[0];
  const green = this.selectedColor.rgba.array[1];
  const blue  = this.selectedColor.rgba.array[2];
  const opacity = 1;
  this.selectedColor.rgba.str = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  
  this.selectedColor.hsla.array = rgbToHsl(this.selectedColor.rgba.array);
  const hue = this.selectedColor.hsla.array[0];
  const saturation = this.selectedColor.hsla.array[1];
  const lightness  = this.selectedColor.hsla.array[2];
  this.selectedColor.hsla.str = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;

  this.selectedHue = hue;
  this.selectedSaturation = saturation;
  this.selectedLightness = lightness;
  this.selectedOpacity = opacity;
  
}
/***********************************************************************************/
ColorPicker.prototype.setColorFromHsla = function(){
  let value = this.colorCodeInput.value;
  let colorsCodeArray = [];
  
  for(let i = 0; i < 4; i++){
    const match = value.match(/\d/);
    if(match){
      const digitIndex = match.index;
      value = value.slice(digitIndex);
      colorsCodeArray.push( parseFloat(value) );
      value = value.slice(colorsCodeArray[i].toString().length);
    }
  }

  let hue = Math.round( colorsCodeArray[0] || 0 );
  let saturation = round( colorsCodeArray[1] || 0 );
  let lightness  = round( colorsCodeArray[2] || 0 );
  let opacity = colorsCodeArray[3];
  
  if(hue > 360){
    hue = hue%360;
  }
  if(saturation > 100){
    saturation = 100;
  }
  if(lightness > 100){
    lightness = 100;
  }
  if(opacity === undefined){
    opacity = 1;
  }
  else if(opacity < 0){
    opacity = 0;
  }
  else if(opacity > 1){
    opacity = ( opacity / Math.pow(10, opacity.toString().length) ).toPrecision(2);
    opacity = Number(opacity);
  }
  
  this.selectedColor.hsla.str = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity })`;
  this.selectedColor.hsla.array = [hue, saturation, lightness, opacity];
  
  const [red, green, blue] = hslToRgb([hue, saturation, lightness]);
  this.selectedColor.rgba.array = [red, green, blue].concat([opacity]);
  this.selectedColor.rgba.str = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  
  this.selectedColor.hex.array = rgbToHex([red, green, blue]);
  this.selectedColor.hex.str = "#" + this.selectedColor.hex.array.join("");
  
  this.selectedHue = hue;
  this.selectedSaturation = saturation;
  this.selectedLightness = lightness;
  this.selectedOpacity = opacity;
  
}
/***********************************************************************************/
ColorPicker.prototype.setColorFromRgba = function(){
  let value = this.colorCodeInput.value;
  let colorsCodeArray = [];
  
  for(let i = 0; i < 4; i++){
    const match = value.match(/\d/);
    if(match){
      const digitIndex = match.index;
      value = value.slice(digitIndex);
      colorsCodeArray.push( parseFloat(value) );
      value = value.slice(colorsCodeArray[i].toString().length);
    }
  }
  
  let red = colorsCodeArray[0] || 0;
  let green = colorsCodeArray[1] || 0;
  let blue  = colorsCodeArray[2] || 0;
  let opacity = colorsCodeArray[3];

  if(red > 255){
    red = 255;
  }
  if(green > 255){
    green = 100;
  }
  if(blue > 255){
    blue = 255;
  }
  if(opacity === undefined){
    opacity = 1;
  }
  else if(opacity < 0){
    opacity = 0;
  }
  else if(opacity > 1){
    opacity = ( opacity / Math.pow(10, opacity.toString().length) ).toPrecision(2);
    opacity = Number(opacity);
  }
  
  this.selectedColor.rgba.str = `rgba(${red}, ${green}, ${blue}, ${opacity })`;
  this.selectedColor.rgba.array = [red, green, blue, opacity];

  const [hue, saturation, lightness] = rgbToHsl([red, green, blue]);
  this.selectedColor.hsla.array = [hue, saturation, lightness].concat([opacity]);
  this.selectedColor.hsla.str = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
  
  this.selectedColor.hex.array = rgbToHex([red, green, blue]);
  this.selectedColor.hex.str = "#" + this.selectedColor.hex.array.join("");
  
  this.selectedHue = hue;
  this.selectedSaturation = saturation;
  this.selectedLightness = lightness;
  this.selectedOpacity = opacity;
  
}
/***********************************************************************************/
ColorPicker.prototype.setColorFromInput = function(){
  
  if(this.selectedColorCode === "hex"){
    this.setColorFromHex();
  }
  else if(this.selectedColorCode === "hsla"){
    this.setColorFromHsla();
  }
  else if(this.selectedColorCode === "rgba"){
    this.setColorFromRgba();      
  }

  this.moveHueSlider(this.selectedHue);
  this.moveSlCursor(this.selectedSaturation, this.selectedLightness);
  this.moveOpacitySlider(this.selectedOpacity);

}
/***********************************************************************************/
/*a function that fills the sl canvas with all values from 0 to 100% of saturation and lightness using the selected hue and opacity*/
ColorPicker.prototype.fillSlSquare = function(){
  if(this.selectedOpacity === 0){
    this.slCanvas.classList.add("transparent-background");
  }
  else{
    this.slCanvas.classList.remove("transparent-background");
  }
  //the size of the square that represent a single color in the sl canvas
  const pixelSize = 2;
  this.slCtx.clearRect(0, 0, this.slCanvas.width, this.slCanvas.height);
  //fill values of saturation and lightness from 0 to 100%
  for(let i = 0;i <= 100; i++){
    for(let j = 0;j <= 100; j++){
      const saturation = j;
      const lightness  = i;
      this.slCtx.fillStyle = `hsla(${this.selectedHue},${saturation}%,${lightness}%,${this.selectedOpacity})`;
      const x = (j * pixelSize);
      const y = (100 - i) * pixelSize;
      this.slCtx.fillRect(x, y, pixelSize, pixelSize);
    }
  }
}
/***********************************************************************************/
ColorPicker.prototype.fillLastSelectedColorSquare = function(){
  if(this.selectedOpacity === 0){
    this.lastSelectedColorSquare.classList.add("transparent-background");
  }
  else{
    this.lastSelectedColorSquare.classList.remove("transparent-background");
  }
  this.lastSelectedColorSquare.style.backgroundColor = this.lastSelectedColor;
}
/***********************************************************************************/
ColorPicker.prototype.fillSelectedColorSquare = function(){
  if(this.selectedOpacity === 0){
    this.selectedColorSquare.classList.add("transparent-background");
  }
  else{
    this.selectedColorSquare.classList.remove("transparent-background");
  }
  this.selectedColorSquare.style.backgroundColor = this.selectedColor.hsla.str;
  for(const callback of this.inputCallbacks){
    callback();
  }
}
/***********************************************************************************/
ColorPicker.prototype.updateSelectedColor = function(){
  //update hsla 
  this.selectedColor.hsla.str = `hsla(${this.selectedHue}, ${this.selectedSaturation}%, ${this.selectedLightness}%, ${this.selectedOpacity})`;
  this.selectedColor.hsla.array = [this.selectedHue, this.selectedSaturation, this.selectedLightness, this.selectedOpacity];
  //update rgba
  const [red, green, blue] = hslToRgb(this.selectedColor.hsla.array);
  this.selectedColor.rgba.str = `rgba(${red}, ${green}, ${blue}, ${this.selectedOpacity})`;
  this.selectedColor.rgba.array = [red, green, blue, this.selectedOpacity];
  //update hex
  this.selectedColor.hex.array = rgbToHex( this.selectedColor.rgba.array.slice(0, 3) );
  this.selectedColor.hex.str = "#" + this.selectedColor.hex.array.join("");

  this.colorCodeInput.value = this.selectedColor[this.selectedColorCode].str;
}
/***********************************************************************************/
ColorPicker.prototype.changeState = function(hue, saturation, lightness, opacity){
  //update hsla 
  this.selectedColor.hsla.str = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
  this.selectedColor.hsla.array = [hue, saturation, lightness, opacity];
  //update rgba
  const [red, green, blue] = hslToRgb(this.selectedColor.hsla.array);
  this.selectedColor.rgba.str = `rgba(${red}, ${green}, ${blue}, ${this.selectedOpacity})`;
  this.selectedColor.rgba.array = [red, green, blue, this.selectedOpacity];
  //update hex
  this.selectedColor.hex.array = rgbToHex( this.selectedColor.rgba.array.slice(0, 3) );
  this.selectedColor.hex.str = "#" + this.selectedColor.hex.array.join("");
  
  this.moveHueSlider(hue);
  this.moveSlCursor(saturation, lightness);
  this.moveOpacitySlider(opacity);
  
  this.fillSlSquare();
  this.fillSelectedColorSquare();
}
/***********************************************************************************/
ColorPicker.prototype.show = function(){
  this.DOM.classList.remove("hide");
}
ColorPicker.prototype.hide = function(){
  this.DOM.classList.add("hide");
}
/***********************************************************************************/
ColorPicker.prototype.moveHueSlider = function(hue){
  if(hue < 0){
    hue = 0;
  }
  else if(hue > 360){
    hue = 360;
  }
  this.selectedHue = hue;
  const leftPosition = this.selectedHue - this.halfSliderSize;
  this.hueSliderBut.style.left = `${leftPosition}px`;
}
/***********************************************************************************/
ColorPicker.prototype.moveOpacitySlider = function(opacity){
  if(opacity < 0){
    opacity = 0;
  }
  else if(opacity > 1){
    opacity = 1;
  }
  this.selectedOpacity = Number( opacity.toFixed(2) );
  const topPosition = (this.selectedOpacity * this.opacityCanvas.height) - this.halfSliderSize;
  this.opacitySliderBut.style.top = `${topPosition}px`;
}
/***********************************************************************************/
ColorPicker.prototype.moveSlCursor = function(saturation, lightness){
  if(saturation < 0){
    saturation = 0;
  }
  else if(saturation > 100){
    saturation = 100;
  }
  if(lightness < 0){
    lightness = 0;
  }
  else if(lightness > 100){
    lightness = 100;
  }
  this.selectedSaturation = saturation;
  this.selectedLightness  = lightness;
  if(this.selectedLightness > 20){
    this.slCursor.style.borderColor = "black";
  }
  else{
    this.slCursor.style.borderColor = "white";
  }
  const leftPosition = (this.selectedSaturation * 2) - this.halfSlCursorSize;
  const topPosition = ( (100 - this.selectedLightness) * 2 ) - this.halfSlCursorSize;
  this.slCursor.style.left = `${leftPosition}px`;
  this.slCursor.style.top  = `${topPosition}px`;
}
/***********************************************************************************/

const chooseColorBut = document.getElementById("choose_color");
const colorPicker = new ColorPicker();
chooseColorBut.addEventListener("click", () => {
  colorPicker.show();
});
colorPicker.onInput(function(){
  chooseColorBut.style.color = colorPicker.selectedColor.hsla.str;
});
colorPicker.onChange(function(){
  document.body.style.backgroundColor = colorPicker.selectedColor.hsla.str;
});

const input = document.querySelector(`input[type="color"]`);
input.addEventListener("change", () =>{
  console.log(input.value);
});