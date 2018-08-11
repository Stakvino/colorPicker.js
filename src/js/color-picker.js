function rgbToHsl(array){
  const norml = array.map( e => Number( (e/255).toFixed(2) ) );
  const red   = norml[0];
  const green = norml[1];
  const blue  = norml[2];
  
  const min = Math.min(...norml);
  const max = Math.max(...norml);
  let Lightness = ( (min + max)/2 ).toFixed(2);
  Lightness = Number(Lightness);
  
  let saturation = 0;
  if(Lightness <= 0.5){
    saturation = (max - min)/(max + min);
  }
  else{
    saturation = (max - min)/(2 - max - min);  
  }

  let hue = 0;
  if(red === max){
    hue = (green - blue) / (max - min);
  }
  else if(green === max){
    hue = 2 + (blue - red) / (max - min);
  }
  else if(blue === max){
    hue = 4 + (red - green) / (max - min);
  }
  
  hue =  Number( hue.toFixed(2) );
  saturation =  Number( saturation.toFixed(2) );
  Lightness  = Number( Lightness.toFixed(2) );
  
  return [hue, saturation, Lightness];
}
function rgbToHex(array){
  return array.map( e => e.toString(16) );
}
/*************************************************/
function hslToRgb(array){
  let temp_1 = null;
  let temp_2 = null;
  const hue = array[0]/360;
  const saturation = array[1]/100;
  const lightness  = array[2]/100;
  /**/
  if(lightness >= 0.5){
    temp_1 = (lightness + saturation) - (lightness * saturation);
  }
  else{
    temp_1 = lightness * (1 + saturation);
  }
  temp_2 = (2 * lightness) - temp_1;
  /**/
  let temporary_R = hue + 0.333;
  let temporary_G = hue;
  let temporary_B = hue - 0.333;
  if(temporary_R < 1){
    temporary_R += 1;
  }
  else if(temporary_R > 1){
    temporary_R -= 1
  }
  if(temporary_G < 1){
    temporary_G += 1;
  }
  else if(temporary_G > 1){
    temporary_G -= 1
  }
  if(temporary_B < 1){
    temporary_B += 1;
  }
  else if(temporary_B > 1){
    temporary_B -= 1
  }
  /**/
  let red = null;
  let green = null;
  let blue = null;
  /*Red*/
  if(6 * temporary_R < 1){
    red = temp_2 + (temp_1 - temp_2) * 6 * temporary_R;
  }
  else if(2 * temporary_R < 1){
    red = temp_1;
  }
  else if(3 * temporary_R < 2){
    red = temp_2 + (temp_1 - temp_2) * (0.666 - temporary_R) * 6;      
  }
  else{
    red = temp_2;
  }
  /*Green*/
  if(6 * temporary_G < 1){
    green = temp_2 + (temp_1 - temp_2) * 6 * temporary_G;
  }
  else if(2 * temporary_G < 1){
    green = temp_1;
  }
  else if(3 * temporary_G < 2){
    green = temp_2 + (temp_1 - temp_2) * (0.666 - temporary_G) * 6;      
  }
  else{
    green = temp_2;
  }
  /*Blue*/
  if(6 * temporary_B < 1){
    blue = temp_2 + (temp_1 - temp_2) * 6 * temporary_B;
  }
  else if(2 * temporary_B < 1){
    blue = temp_1;
  }
  else if(3 * temporary_B < 2){
    blue = temp_2 + (temp_1 - temp_2) * (0.666 - temporary_B) * 6;      
  }
  else{
    blue = temp_2;
  }
  
  red   = Math.round( red * 255 );
  green = Math.round( green * 255 );
  blue  = Math.round( blue * 255 );
  
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
    this.mainBlock = this.create();
    /*********************************************************************************/
    this.hueCanvas = this.mainBlock.getElementsByClassName("hue-canvas")[0];
    this.hueSliderBut = this.mainBlock.getElementsByClassName("hue-slider-button")[0];
    this.opacityCanvas = this.mainBlock.getElementsByClassName("opacity-canvas")[0];
    this.opacitySliderBut = this.mainBlock.getElementsByClassName("opacity-slider-button")[0];
    this.slCanvas = this.mainBlock.getElementsByClassName("sl-canvas")[0];
    this.slCursor = this.mainBlock.getElementsByClassName("sl-cursor")[0];
    this.slCtx    = this.slCanvas.getContext("2d");
    
    /*********************************************************************************/
    this.selectedColorSquare = this.mainBlock.getElementsByClassName("selected-color")[0];
    this.colorCodeInput = this.mainBlock.getElementsByClassName("color-code")[0];
    
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
    this.init();
    this.AttachEventHandlers();
  }
  
  get halfSliderSize(){
    return this.hueSliderBut.clientWidth/2;
  } 
  
  get halfSlCursorSize(){
    return this.slCursor.clientWidth/2;
  }
  
  create(){
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
      <div class="sl-block">
       <canvas width="200" height="200" class="sl-canvas"></canvas>
       <div class="sl-cursor"></div>
      </div>
      <div class="opacity-block">
        <canvas width="20" height="200" class="opacity-canvas"></canvas>
        <div class="slider-button opacity-slider-button"></div>
      </div>
      <input type="text" spellcheck="false" class="color-code hex-letter-spacing">
      <div class="selected-color"></div>
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
  this.updateSelectedColor();
  /***********************************************************************************/
  document.body.appendChild(this.mainBlock);
}

ColorPicker.prototype.AttachEventHandlers = function(){
  const closeBlock   = this.mainBlock.getElementsByClassName("close-block")[0];
  //close, cancel and select button hide the color picker
  const closeButton  = this.mainBlock.getElementsByClassName("close-but")[0];
  const cancelButton = this.mainBlock.getElementsByClassName("cancel-but")[0];
  const selectButton = this.mainBlock.getElementsByClassName("select-but")[0];
  closeButton.addEventListener("click", () => this.hide() );
  cancelButton.addEventListener("click", () => this.hide() );
  selectButton.addEventListener("click", () => this.hide() );
  /***********************************************************************************/
  let mouseLastPosition = {x : null, y : null};
  
  let closeBlockClicked = false;
  //drag color picker to change his position in the page
  closeBlock.addEventListener( "mousedown", (e) => {
    e.preventDefault();
    mouseLastPosition.x = null;
    mouseLastPosition.y = null;
    closeBlockClicked = true;
  });
  addEventListener( "mouseup", () => closeBlockClicked = false );

  addEventListener("mousemove", (e) => {
    if(closeBlockClicked){
      const distanceMoved = {
        x : e.pageX - (mouseLastPosition.x || e.pageX),
        y : e.pageY - (mouseLastPosition.y || e.pageY)
      };

      this.mainBlock.style.left = `${this.mainBlock.offsetLeft + distanceMoved.x}px`;
      this.mainBlock.style.top  = `${this.mainBlock.offsetTop + distanceMoved.y}px`;

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
      const newHueValue = e.pageX - hueCanvasPosition;
      this.moveHueSlider(newHueValue);
      this.fillSlSquare();
      this.updateSelectedColor();
    }
  });

  this.hueCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    hueSliderClicked = true;
    const hueCanvasPosition = this.hueCanvas.getClientRects()[0].x;
    const newHueValue = e.pageX - hueCanvasPosition;
    this.moveHueSlider(newHueValue);
    this.fillSlSquare();
    this.updateSelectedColor();
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
      const newOpacityValue = (e.pageY -this.opacityCanvas.getClientRects()[0].top)/200;
      this.moveOpacitySlider(newOpacityValue);
      this.fillSlSquare();
      this.updateSelectedColor();
    }
  });

  this.opacityCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    opacitySliderClicked = true;
    const newOpacityValue = (e.pageY -this.opacityCanvas.getClientRects()[0].top)/200;
    this.moveOpacitySlider(newOpacityValue);
    this.fillSlSquare();
    this.updateSelectedColor();
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
    const saturation = (e.pageX - slCanvasClientRect.x)/2;
    const lightness = 100 - (e.pageY - slCanvasClientRect.y)/2;
    this.moveSlCursor(saturation, lightness);
    this.updateSelectedColor();
  });

  addEventListener("mouseup", () => slCanvasClicked = false );

  addEventListener("mousemove", (e) => {
    if(slCursorClicked){
      //change cursor position in sl canvas
      const slCanvasClientRect = this.slCanvas.getClientRects()[0];
      const saturation = (e.pageX - slCanvasClientRect.x)/2;
      const lightness = 100 - (e.pageY - slCanvasClientRect.y)/2;
      this.moveSlCursor(saturation, lightness);
      this.updateSelectedColor();
    }
  
  });
  /***********************************************************************************/
  this.colorCodeInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
      this.setColorFromInput();
      this.fillSlSquare();
      this.updateSelectedColor();
    }
  });
  /***********************************************************************************/
  //choosing a conversion button will highlight it and change the value of this.selectedColorCode
  const conversionButtons = Array.from( this.mainBlock.getElementsByClassName("conversion-buttons")[0].children );
  
  for(let i = 0; i < conversionButtons.length; i++){
    const button = conversionButtons[i];
    button.addEventListener("click", () => {
      const currentSelected = conversionButtons.filter(but => but.classList.contains("selected-color-code") )[0];
      currentSelected.classList.remove("selected-color-code");
      button.classList.add("selected-color-code");
      this.selectedColorCode = button.dataset.code;
      this.colorCodeInput.value = this.selectedColor[this.selectedColorCode].str;
      if(this.selectedColorCode === "hex"){
        this.colorCodeInput.classList.add("hex-letter-spacing");
      }
      else{
        this.colorCodeInput.classList.remove("hex-letter-spacing");
      }
    });
    
    button.addEventListener("focus", () => button.style.outline = "none");
  }
}
/***********************************************************************************/
ColorPicker.prototype.setColorFromHex = function(){
  let value = this.colorCodeInput.value;
  let colorsCodeArray = [];
  colorsCodeArray = value.match(/[0-9a-fA-F]/g);
  if(colorsCodeArray === null || (colorsCodeArray.length < 6 && colorsCodeArray.length !== 3) ){
    colorsCodeArray = ["00", "00", "00"];
  }
  else if(colorsCodeArray.length >= 6){
    colorsCodeArray = colorsCodeArray.slice(0, 6);
    for(let i = 0; i < colorsCodeArray.length/2; i++){
      colorsCodeArray[i] = colorsCodeArray[i * 2] + colorsCodeArray[ (2 * i) + 1];
    }
    colorsCodeArray.splice(0, 3);
  }
  else if(colorsCodeArray.length === 3){
    //duplicate each element of the array
    colorsCodeArray.map( e => e.repeat(2) );
  }
  
  this.selectedColor.hex.array = colorsCodeArray.slice();
  this.selectedColor.hex.str = "#" + colorsCodeArray.join();
  
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
  this.selectedColor.hsla.str = `rgba(${hue}, ${saturation}, ${lightness}, ${opacity})`;
  
  this.selectedHue = hue;
  this.selectedSaturation = saturation;
  this.selectedLightness = lightness;
  this.selectedOpacity = opacity;
  
  this.colorCodeInput.value = this.selectedColor.hex.str;
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
  
  let hue = colorsCodeArray[0] || 0;
  let saturation = colorsCodeArray[1] || 0;
  let lightness  = colorsCodeArray[2] || 0;
  let opacity = colorsCodeArray[3] || 1;

  if(hue > 360){
    hue = hue%360;
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
  this.selectedColor.hsla.str = `hsla(${hue || 0}, ${saturation}%, ${lightness}%, ${opacity })`;
  this.selectedColor.hsla.array = hslaArray.slice();
}
/***********************************************************************************/
ColorPicker.prototype.setColorFromRgba = function(){
}
/***********************************************************************************/
ColorPicker.prototype.setColorFromInput = function(){
  
  if(this.selectedColorCode === "hex"){
    this.setColorFromHex();
  }
  else{
    
  }
  
  this.moveHueSlider(this.selectedHue);
  this.moveSlCursor(this.selectedSaturation, this.selectedLightness);
  this.moveOpacitySlider(this.selectedOpacity);

}
/***********************************************************************************/
/*a function that fills the sl canvas with all values from 0 to 100% of saturation and lightness using the selected hue and opacity*/
ColorPicker.prototype.fillSlSquare = function(){
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
ColorPicker.prototype.updateSelectedColor = function(){
  this.selectedColor.hsla.str = `hsla(${this.selectedHue}, ${this.selectedSaturation}%, ${this.selectedLightness}%, ${this.selectedOpacity})`;
  this.colorCodeInput.value = this.selectedColor.hex.str;
  this.selectedColorSquare.style.backgroundColor = this.selectedColor.hsla.str;
}
/***********************************************************************************/
ColorPicker.prototype.show = function(){
  this.mainBlock.classList.remove("hide");
}
ColorPicker.prototype.hide = function(){
  this.mainBlock.classList.add("hide");
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