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
    
    let hexColor = `#000000`;
    const rHex = /^#[0-9a-fA-F]{6}$/;
    
    let hslaColor = `hsla(0, 0%, 0%, 1)`;
    const rHsla = /^hsla\((\d{1,3}(\.\d+)?),(\d{1,3}(\.\d+)?)%*,(\d{1,3}(\.\d+)?)%*,(0|0?(\.\d+)|1(\.\d+)?)\)/;
    const rHsl = /^hsl\((\d{1,3}(\.\d+)?),(\d{1,3}(\.\d+)?)%*,(\d{1,3}(\.\d+)?)%*\)/;
    
    let rgbaColor = `rgba(0, 0, 0, 1)`;
    const rRgba = /^rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),(0|0?(\.\d\d?)|1(\.\d\d?)?)\)/;
    const rRgb  = /^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/;
    
    const rDigit = /\d/;
    
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
        array : [0, 0, 0]
      }
    };
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
      <input type="text" class="color-code">
      <div class="selected-color"></div>
      <div class="conversion-buttons">
        <button type="button" class="hex-but">HEX</button>
        <button type="button" class="hsla-but">HSLA</button>
        <button type="button" class="rgba-but">RGBA</button>
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
  this.fillSelectedColorSquare();
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
    mouseLastPosition.x = null;
    hueSliderClicked = true;
  });
  addEventListener( "mouseup",() => hueSliderClicked = false );

  addEventListener("mousemove", (e) => {
    if(hueSliderClicked){
      const distanceMoved = e.pageX - (mouseLastPosition.x || e.pageX);
      let newHueValue = this.selectedHue + distanceMoved;
      this.moveHueSlider(newHueValue);
      this.fillSlSquare();
      this.fillSelectedColorSquare();
      mouseLastPosition.x = e.pageX;
    }
  });

  this.hueCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    mouseLastPosition.x = null;
    hueSliderClicked = true;

    const hueCanvasPosition = this.hueCanvas.getClientRects()[0].x;
    const newHueValue = e.pageX - hueCanvasPosition;
    this.moveHueSlider(newHueValue);
    this.fillSlSquare();
    this.fillSelectedColorSquare();
  });
  /***********************************************************************************/
  //opacity slider event handler
  let opacitySliderClicked = false;

  this.opacitySliderBut.addEventListener( "mousedown", (e) => {
    e.preventDefault();
    mouseLastPosition.y = null;
    opacitySliderClicked = true;
  });
  addEventListener( "mouseup",() => opacitySliderClicked = false );

  addEventListener("mousemove", (e) => {
    if(opacitySliderClicked){
      const distanceMoved = e.pageY - (mouseLastPosition.y || e.pageY);
      let newOpacityValue = this.selectedOpacity + (distanceMoved/200);
      this.moveOpacitySlider(newOpacityValue);
      this.fillSlSquare();
      this.fillSelectedColorSquare();
      mouseLastPosition.y = e.pageY;
    }
  });

  this.opacityCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    mouseLastPosition.y = null;
    opacitySliderClicked = true;

    const opacityCanvasPosition = this.opacityCanvas.getClientRects()[0].y;
    const newOpacityValue = (e.pageY - opacityCanvasPosition)/200;
    this.moveOpacitySlider(newOpacityValue);
    this.fillSlSquare();
    this.fillSelectedColorSquare();
  });
  /***********************************************************************************/
  //sl cursor event handler
  let slCursorClicked = false;
  this.slCursor.addEventListener("mousedown", () => slCursorClicked = true );
  addEventListener("mouseup", () => slCursorClicked = false );
  let slCanvasClicked = false;
  //clicking on the sl canvas will change the saturation and lightness of the color and sl canvas cursor position
  this.slCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    mouseLastPosition.x = null;
    mouseLastPosition.y = null;
    slCanvasClicked = true;
    
    //change cursor position in sl canvas
    const slCanvasClientRect = this.slCanvas.getClientRects()[0];
    const saturation = (e.pageX - slCanvasClientRect.x)/2;
    const lightness = 100 - (e.pageY - slCanvasClientRect.y)/2;
    this.moveSlCursor(saturation, lightness);
    this.fillSelectedColorSquare();
  });

  addEventListener("mouseup", () => slCanvasClicked = false );

  addEventListener("mousemove", (e) => {
    if(slCanvasClicked || slCursorClicked){
      //change cursor position in sl canvas
      const slCanvasClientRect = this.slCanvas.getClientRects()[0];
      const saturation = (e.pageX - slCanvasClientRect.x)/2;
      const lightness = 100 - (e.pageY - slCanvasClientRect.y)/2;
      this.moveSlCursor(saturation, lightness);
      this.fillSelectedColorSquare();
    }
  });
  /***********************************************************************************/
  this.colorCodeInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
      this.colorCodeInput.value = this.setColorFromInput();
      this.fillSlSquare();
      this.fillSelectedColorSquare();
    }
  });
}
/***********************************************************************************/
ColorPicker.prototype.setColorFromInput = function(){
  let value = this.colorCodeInput.value;
  const hslaArray = [];
  for(let i = 0; i < 4; i++){
    const match = value.match(/\d/);
    if(match){
      const digitIndex = match.index;
      value = value.slice(digitIndex);
      hslaArray.push( parseFloat(value) );
      value = value.slice(hslaArray[i].toString().length);
    }
  }
  let hue = hslaArray[0];
  let saturation = hslaArray[1];
  let lightness  = hslaArray[2];
  let opacity = hslaArray[3];
  
  if(hue < 0){
    hue = 360 + (hue%360)
  }
  else if(hue > 360){
    hue = hue%360;
  }
  if(saturation < 0 || saturation === undefined){
    saturation = 0;
  }
  else if(saturation > 100){
    saturation = 100;
  }
  if(lightness < 0 || lightness === undefined){
    lightness = 0;
  }
  else if(lightness > 100){
    lightness = 100;
  }
  if(opacity < 0 || opacity === undefined){
    opacity = 0;
  }
  else if(opacity > 1){
    opacity = 1;
  }
  this.selectedColor.hsla.str = `hsla(${hue || 0}, ${saturation}%, ${lightness}%, ${opacity })`;
  this.selectedColor.hsla.array = hslaArray.slice();
  
  this.moveHueSlider(hue);
  this.moveSlCursor(saturation, lightness);
  this.moveOpacitySlider(opacity);

  return this.selectedColor.hsla.str;
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
ColorPicker.prototype.fillSelectedColorSquare = function(){
  this.selectedColor.hsla.str = `hsla(${this.selectedHue}, ${this.selectedSaturation}%, ${this.selectedLightness}%, ${this.selectedOpacity})`;
  this.colorCodeInput.value = this.selectedColor.hsla.str;
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