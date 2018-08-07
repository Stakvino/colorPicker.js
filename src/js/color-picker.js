class ColorPicker{
  constructor(){
    this.mainBlock = this.create();
    /*********************************************************************************/
    this.hueCanvas = this.mainBlock.getElementsByClassName("hue-canvas")[0];
    this.opacityCanvas = this.mainBlock.getElementsByClassName("opacity-canvas")[0];
    this.slCanvas = this.mainBlock.getElementsByClassName("sl-canvas")[0];
    this.slCtx    = this.slCanvas.getContext("2d");
    /*********************************************************************************/
    this.selectedColorSquare = this.mainBlock.getElementsByClassName("selected-color")[0];
    let hexColor  = `#000000`;
    let hslaColor = `hsla(0, 0%, 0%, 1)`;
    let rgbaColor = `rgba(0, 0, 0, 1)`;
    
    this.selectedColor = {
      get hex(){
        return hexColor;
      },
      get hsla(){
        return hslaColor;
      },
      get rgba(){
        return rgbaColor;
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
      <div class="sl-opacity">
       <canvas width="200" height="200" class="sl-canvas"></canvas>
       <div class="opacity-block">
          <canvas width="20" height="200" class="opacity-canvas"></canvas>
          <div class="slider-button opacity-slider-button"></div>
       </div>
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
  closeButton.addEventListener("click", () => this.mainBlock.classList.add("hide") );
  cancelButton.addEventListener("click", () => this.mainBlock.classList.add("hide") );
  selectButton.addEventListener("click", () => this.mainBlock.classList.add("hide") );
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
  const halfSliderSize = 13;
  const hueSliderBut = this.mainBlock.getElementsByClassName("hue-slider-button")[0];
  let hueSliderClicked = false;

  hueSliderBut.addEventListener( "mousedown", (e) => {
    e.preventDefault();
    mouseLastPosition.x = null;
    hueSliderClicked = true;
  });
  addEventListener( "mouseup",() => hueSliderClicked = false );

  addEventListener("mousemove", (e) => {
    if(hueSliderClicked){
      const distanceMoved = e.pageX - (mouseLastPosition.x || e.pageX);
      let newHueValue = this.selectedHue + distanceMoved;
      if(newHueValue < 0){
        newHueValue = 0;
      }
      if(newHueValue > 360){
        newHueValue = 360;
      }
      hueSliderBut.style.left = `${newHueValue - halfSliderSize}px`;
      this.selectedHue = newHueValue;
      this.fillSlSquare();
      mouseLastPosition.x = e.pageX;
    }
  });

  this.hueCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    mouseLastPosition.x = null;
    hueSliderClicked = true;

    const hueCanvasPosition = this.hueCanvas.getClientRects()[0].x;
    const newLeftPosition = e.pageX - hueCanvasPosition;
    if(newLeftPosition >= 0 && newLeftPosition <= 360){
      hueSliderBut.style.left = `${newLeftPosition - halfSliderSize}px`;
      this.selectedHue = newLeftPosition;
      this.fillSlSquare(); 
    }
  });
  /***********************************************************************************/
  //opacity slider event handler
  const opacitySliderBut = this.mainBlock.getElementsByClassName("opacity-slider-button")[0];
  let opacitySliderClicked = false;

  opacitySliderBut.addEventListener( "mousedown", (e) => {
    e.preventDefault();
    mouseLastPosition.y = null;
    opacitySliderClicked = true;
  });
  addEventListener( "mouseup",() => opacitySliderClicked = false );

  addEventListener("mousemove", (e) => {
    if(opacitySliderClicked){
      const distanceMoved = e.pageY - (mouseLastPosition.y || e.pageY);
      let newOpacityValue = (this.selectedOpacity * this.opacityCanvas.height) + distanceMoved;
      if(newOpacityValue < 0){
        newOpacityValue = 0;
      }
      if(newOpacityValue > 200){
        newOpacityValue = 200;
      }
      opacitySliderBut.style.top = `${newOpacityValue - halfSliderSize}px`;
      this.selectedOpacity = newOpacityValue/200;
      this.fillSlSquare();
      mouseLastPosition.y = e.pageY;
    }
  });

  this.opacityCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    mouseLastPosition.y = null;
    opacitySliderClicked = true;

    const opacityCanvasPosition = this.opacityCanvas.getClientRects()[0].y;
    const newTopPosition = e.pageY - opacityCanvasPosition;
    if(newTopPosition >= 0 && newTopPosition <= 360){
      opacitySliderBut.style.top = `${newTopPosition - halfSliderSize}px`;
      this.selectedOpacity = newTopPosition/200;
      this.fillSlSquare(); 
    }
  });
  /***********************************************************************************/
  let slCanvasClicked = false;
  //clicking on the sl canvas will change the saturation and lightness of the color
  this.slCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    mouseLastPosition.x = null;
    mouseLastPosition.y = null;
    slCanvasClicked = true;

    this.selectedSaturation = (e.pageX - this.getClientRects()[0].x)/2;
    this.selectedLightness  = 100 - (e.pageY - this.getClientRects()[0].y)/2;
  });

  addEventListener("mouseup", () => slCanvasClicked = false );

  this.slCanvas.addEventListener("mousemove", (e) => {
    if(slCanvasClicked){
      this.selectedSaturation = (e.pageX - this.getClientRects()[0].x)/2;
      this.selectedLightness  = 100 - (e.pageY - this.getClientRects()[0].y)/2;
    }
  });
}

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

ColorPicker.prototype.fillSelectedColorSquare = function(){
  this.selectedColorSquare.style.backgroundColor = this.selectedColor.hsla;
}


const chooseColorBut = document.getElementById("choose_color");
const colorPicker = new ColorPicker();
chooseColorBut.addEventListener("click", () => {
  colorPicker.mainBlock.classList.remove("hide");
});

