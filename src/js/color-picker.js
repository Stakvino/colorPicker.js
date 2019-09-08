const helper = require('./lib/helper.js');
const round = helper.round;
const throttled = helper.throttled;

const colorConversion = require('./lib/color-conversion.js');
const hslToRgb = colorConversion.hslToRgb;
const hslToHex = colorConversion.hslToHex;

/*
const rgbToHsl = colorConversion.rgbToHsl;
const rgbToHex = colorConversion.rgbToHex;
const hexToRgb = colorConversion.hexToRgb;
const hexToHsl = colorConversion.hexToHsl;
*/

class ColorPicker{
  constructor(){
    this.DOM = this.create();
    this.closeButton  = this.DOM.querySelector("button.close-but");
    this.cancelButton = this.DOM.querySelector("button.cancel-but");
    this.selectButton = this.DOM.querySelector("button.select-but");
    /*********************************************************************************/
    this.hueCanvas = this.DOM.querySelector("canvas.hue-canvas");
    this.hueSliderBut = this.DOM.querySelector("div.hue-slider-button");
    this.opacityCanvas = this.DOM.querySelector("canvas.opacity-canvas");
    this.opacitySliderBut = this.DOM.querySelector("div.opacity-slider-button");
    this.slCanvas = this.DOM.querySelector("canvas.sl-canvas");
    this.slCursor = this.DOM.querySelector("div.sl-cursor");
    this.slCtx    = this.slCanvas.getContext("2d");
    /*********************************************************************************/
    this.lastSelectedColorSquare = this.DOM.querySelector("div.last-selected-color");
    this.selectedColorSquare = this.DOM.querySelector("div.selected-color");
    this.colorCodeInput = this.DOM.querySelector("input.color-code");
    
    this.lastSelectedColor = `hsla(360, 100%, 100%, 1)`;
    this.selectedColor = {
      hsla : {
        str   : `hsla(360, 100%, 100%, 1)`,
        array : [360, 100, 100, 1]
      },
      rgba : {
        str   : `rgba(255, 255, 255, 1)`,
        array : [255, 255, 255, 1]
      },
      hex  : {
        str   : `#ffffff`,
        array : ["ff", "ff", "ff"]
      }
    };
    this.selectedColorCode = "hex";
    /*********************************************************************************/
    this.selectedHue = 360;
    this.selectedSaturation = 100;
    this.selectedLightness = 100;
    this.selectedOpacity = 1;
    /*********************************************************************************/
    this.inputCallbacks  = [];
    this.changeCallbacks = [];
    /*********************************************************************************/
    this.init();
    this.AttachEventHandlers();
  }
  
  //shortcuts to avoid nested objects in this.selectedColor
  get selectedHex(){
    return this.selectedColor.hex.str;
  }
  get selectedRgba(){
    return this.selectedColor.rgba.str;
  }
  get selectedHsla(){
    return this.selectedColor.hsla.str;
  }
  
  get halfSliderSize(){
    return this.hueSliderBut.clientWidth/2;
  } 
  
  get halfSlCursorSize(){
    return this.slCursor.clientWidth/2;
  }
  
}
/*********************************************************************************/
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
/*********************************************************************************/
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
  /*********************************/
  const opacityCtx = this.opacityCanvas.getContext("2d");
  const opacityCanvasWidth  = this.opacityCanvas.width;
  const opacityCanvasHeight = this.opacityCanvas.height;
  //fill the opacity canvas with values from 0 to 100%
  for(let i = 0;i <= opacityCanvasHeight; i++){
    opacityCtx.fillStyle = `rgba(0,0,0,${i/opacityCanvasHeight})`;
    opacityCtx.fillRect(0, i, opacityCanvasWidth, 2);
  }
  this.fillLastSelectedColorSquare();
  this.colorCodeInput.value = this.selectedColor.hex.str;
  this.fillSlSquare();
  this.fillSelectedColorSquare();
  /**********************************/
  document.body.appendChild(this.DOM);
  //initial position of the color picker
  const left = innerWidth/2 - 250;
  this.DOM.style.left = `${left}px`;
}
/*********************************************************************************/
const throttled_delay = 60;
ColorPicker.prototype.AttachEventHandlers = function(){
  //close, cancel and select button hide the color picker
  this.closeButton.addEventListener("click", () => {
    this.hide();
  });
  
  this.cancelButton.addEventListener("click", () => {
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
  /*allow user to drag the color picker and change his position on the page by holding mouse left click on the color picker and moving the mouse*/
  let mouseLastPosition = {x : null, y : null};
  let mainBlockClicked = false;
  const closeBlock   = this.DOM.querySelector("div.close-block");
  const mainBlock   = this.DOM.querySelector("div.main-block");
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

  addEventListener("mousemove",throttled(throttled_delay, e => {
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
    })
  );
  /***********************************************************************************/
  //hue slider event handler
  let hueSliderClicked = false;

  this.hueSliderBut.addEventListener( "mousedown", (e) => {
    e.preventDefault();
    hueSliderClicked = true;
  });
  addEventListener( "mouseup",() => hueSliderClicked = false );

  addEventListener("mousemove",throttled(throttled_delay, e => {
      if(hueSliderClicked){
        const hueCanvasPosition = this.hueCanvas.getClientRects()[0].left;
        const newHueValue = e.pageX - hueCanvasPosition - window.scrollX;
        const colorArray = [newHueValue, this.selectedSaturation, this.selectedLightness, this.selectedOpacity];
        this.changeState("hsla", colorArray);
        this.colorCodeInput.value = this.selectedColor[this.selectedColorCode].str;

        //Execute input callbacks
        for(const callback of this.inputCallbacks){
          callback();
        }
      }
    }) 
  );

  this.hueCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    hueSliderClicked = true;
    const hueCanvasPosition = this.hueCanvas.getClientRects()[0].x;
    const newHueValue = e.pageX - hueCanvasPosition - window.scrollX;
    const colorArray = [newHueValue, this.selectedSaturation, this.selectedLightness, this.selectedOpacity];
    this.changeState("hsla", colorArray);
    this.colorCodeInput.value = this.selectedColor[this.selectedColorCode].str;

    //Execute input callbacks
    for(const callback of this.inputCallbacks){
      callback();
    }
  });
  /***********************************************************************************/
  //opacity slider event handler
  let opacitySliderClicked = false;

  this.opacitySliderBut.addEventListener( "mousedown", (e) => {
    e.preventDefault();
    opacitySliderClicked = true;
  });
  addEventListener( "mouseup",() => opacitySliderClicked = false );

  addEventListener("mousemove", throttled(throttled_delay, e => {
      if(opacitySliderClicked){
        const newOpacityValue = (e.pageY - this.opacityCanvas.getClientRects()[0].top - window.scrollY)/200;
        this.moveOpacitySlider(newOpacityValue);
        const colorArray = [this.selectedHue, this.selectedSaturation, this.selectedLightness, newOpacityValue];
        this.changeState("hsla", colorArray);
        this.colorCodeInput.value = this.selectedColor[this.selectedColorCode].str;

        //Execute input callbacks
        for(const callback of this.inputCallbacks){
          callback();
        }
      }
    })
  );

  this.opacityCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    opacitySliderClicked = true;
    const newOpacityValue = (e.pageY - this.opacityCanvas.getClientRects()[0].top - window.scrollY)/200;
    const colorArray = [this.selectedHue, this.selectedSaturation, this.selectedLightness, newOpacityValue];
    this.changeState("hsla", colorArray);
    this.colorCodeInput.value = this.selectedColor[this.selectedColorCode].str;

    //Execute input callbacks
    for(const callback of this.inputCallbacks){
      callback();
    }
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
    const colorArray = [this.selectedHue, saturation, lightness, this.selectedOpacity];
    this.changeState("hsla", colorArray);
    this.colorCodeInput.value = this.selectedColor[this.selectedColorCode].str;

    //Execute input callbacks
    for(const callback of this.inputCallbacks){
      callback();
    }
  });

  addEventListener("mousemove", throttled(throttled_delay, e => {
      if(slCursorClicked){
        //change cursor position in sl canvas
        const slCanvasClientRect = this.slCanvas.getClientRects()[0];
        const saturation = (e.pageX - slCanvasClientRect.x - window.scrollX)/2;
        const lightness = 100 - (e.pageY - slCanvasClientRect.y - window.scrollY)/2;
        const colorArray = [this.selectedHue, saturation, lightness, this.selectedOpacity];
        this.changeState("hsla", colorArray);
        this.colorCodeInput.value = this.selectedColor[this.selectedColorCode].str;
        //Execute input callbacks
        for(const callback of this.inputCallbacks){
          callback();
        }
      }
    
    })
  );
  /***********************************************************************************/
  this.colorCodeInput.addEventListener("input", () => {
    let colorArray = [];
    if(this.selectedColorCode === "hex"){
      colorArray = this.getColorFromHex();
    }
    else if(this.selectedColorCode === "hsla"){
      colorArray = this.getColorFromHsla();
    }
    else if(this.selectedColorCode === "rgba"){
      colorArray = this.getColorFromRgba();      
    }

    this.changeState(this.selectedColorCode, colorArray);
  });
  /***********************************************************************************/
  this.colorCodeInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
      this.colorCodeInput.value = this.selectedColor[this.selectedColorCode].str;
    }
  });
  /***********************************************************************************/
  //choosing a conversion button will highlight it and change the value of this.selectedColorCode
  const conversionButtons = Array.from( this.DOM.querySelector("div.conversion-buttons").children );
  
  for(let i = 0; i < conversionButtons.length; i++){
    const currentSelected = conversionButtons[i];
    currentSelected.addEventListener("click", () => {
      const prevSelected = conversionButtons.filter(but => but.classList.contains("selected-color-code") )[0];
      prevSelected.classList.remove("selected-color-code");
      currentSelected.classList.add("selected-color-code");
      this.selectedColorCode = currentSelected.dataset.code;
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
ColorPicker.prototype.removeOnInput = function(callback){
  this.inputCallbacks.splice(this.inputCallbacks.indexOf(callback), 1);
}
/***********************************************************************************/
ColorPicker.prototype.onChange = function(callback){
  this.changeCallbacks.push(callback);
}
ColorPicker.prototype.removeOnChange = function(callback){
  this.changeCallbacks.splice(this.changeCallbacks.indexOf(callback), 1);
}
/***********************************************************************************/
ColorPicker.prototype.onSelect = function(callback){
  this.selectButton.addEventListener("click", callback);
}
ColorPicker.prototype.removeOnSelect = function(callback){
  this.selectButton.removeEventListener("click", callback);
}
/***********************************************************************************/
ColorPicker.prototype.onCancel = function(callback){
  this.cancelButton.addEventListener("click", callback);
}
ColorPicker.prototype.removeOnCancel = function(callback){
  this.cancelButton.removeEventListener("click", callback);
}
/***********************************************************************************/
ColorPicker.prototype.onClose = function(callback){
  this.closeButton.addEventListener("click", callback);
}
ColorPicker.prototype.removeOnClose = function(callback){
  this.closeButton.removeEventListener("click", callback);
}
/***********************************************************************************/
ColorPicker.prototype.getColorFromHex = function(){
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

  return colorsCodeArray;
}
/***********************************************************************************/
ColorPicker.prototype.getColorFromHsla = function(){
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
  
  return [hue, saturation, lightness, opacity];
}
/***********************************************************************************/
ColorPicker.prototype.getColorFromRgba = function(){
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

  return [red, green, blue, opacity];
}
/***********************************************************************************/
/*fill the sl canvas with all values from 0 to 100% of saturation and lightness using the selected hue and opacity*/
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
}
/***********************************************************************************/
ColorPicker.prototype.changeState = function(colorCode, colorArray){
  if(colorArray === undefined){
    return;
  }
  colorArray = colorArray.map(e => {
    if(e < 0){
      return 0;
    }else{
      return e;
    }
  });
  
  
  let [hue, saturation, lightness, opacity] = colorArray;
  
  if(hue > 360){
    hue = 360;
  }
  if(saturation > 100){
    saturation = 100;
  }
  if(lightness > 100){
    lightness = 100;
  }
  if(opacity > 1){
    opacity = 1;
  }

  colorArray = [hue, saturation, lightness, opacity];

  const hslArray = colorArray.slice(0, 3);
  const hexArray  = hslToHex(hslArray);
  const rgbArray = hslToRgb(hslArray);

  //update hsla
  this.selectedColor.hsla.str = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
  this.selectedColor.hsla.array = [hue, saturation, lightness, opacity];
  //update rgba
  const [red, green, blue] = rgbArray;
  this.selectedColor.rgba.str = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  this.selectedColor.rgba.array = [red, green, blue, opacity];
  //update hex
  this.selectedColor.hex.array = hexArray.slice();
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
  this.selectedHue = Math.round(hue);
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
  this.selectedSaturation = round(saturation);
  this.selectedLightness  = round(lightness);
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

