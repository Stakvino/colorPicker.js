const hueBlock = document.getElementsByClassName("hue-block")[0];
const hueCanvas = document.getElementById("hue_canvas");
const hueCtx = hueCanvas.getContext("2d");
//fill the hue canvas with all colors from 0 to 360 degrees
for(let i = 0;i <= 360; i++){
  hueCtx.fillStyle = `hsl(${i},100%,50%)`;
  hueCtx.fillRect(i, 0, 1, hueCanvas.clientHeight);
}

const slCanvas = document.getElementById("sl_canvas");
const slCtx = slCanvas.getContext("2d");

/*a function that fills a squared canvas with all values from 0 to 100% of saturation and lightness given a hue and opacity value*/
function fillSlSquare(hue, opacity = 1){
  //the size of the square that represent a single color in the sl canvas
  const pixelSize = 2;
  if(opacity < 1){
    slCtx.clearRect(0, 0, slCanvas.width, slCanvas.height);
  }
  //fill values of saturation and lightness from 0 to 100%
  for(let i = 0;i <= 100; i++){
    for(let j = 0;j <= 100; j++){
      const saturation = j;
      const lightness  = i;
      slCtx.fillStyle = `hsla(${hue},${saturation}%,${lightness}%,${opacity})`;
      const x = (j * pixelSize);
      const y = (100 - i) * pixelSize;
      slCtx.fillRect(x, y, pixelSize, pixelSize);
    }
  }
}

const opacityCanvas = document.getElementById("opacity_canvas");
const opacityCtx = opacityCanvas.getContext("2d");
const opacityCanvasHeight = opacityCanvas.clientHeight;
//fill the opacity canvas with values from 0 to 100%
for(let i = 0;i <= opacityCanvasHeight; i++){
  opacityCtx.fillStyle = `rgba(0,0,0,${i/opacityCanvasHeight})`;
  opacityCtx.fillRect(0, i, opacityCanvas.clientWidth, 2);
}

let selectedHue = 0;
let selectedOpacity = 1;
//init sl canvas with 0 degree hue
fillSlSquare(selectedHue, selectedOpacity);

let mouseLastPosition = null;

const hueSliderBut = document.getElementById("hue_slider_button");
const halfSliderSize = hueSliderBut.clientWidth/2;
let hueSliderClicked = false;

hueSliderBut.addEventListener( "mousedown",(e) => {
  e.preventDefault();
  mouseLastPosition = null;
  hueSliderClicked = true;
});
addEventListener( "mouseup",() => hueSliderClicked = false );

addEventListener("mousemove",function(e){
  if(hueSliderClicked){
    const distanceMoved = e.pageX - (mouseLastPosition || e.pageX);
    let newHueValue = selectedHue + distanceMoved;
    if(newHueValue < 0){
      newHueValue = 0;
    }
    if(newHueValue > 360){
      newHueValue = 360;
    }
    hueSliderBut.style.left = `${newHueValue - halfSliderSize}px`;
    selectedHue = newHueValue;
    fillSlSquare(selectedHue, selectedOpacity);
    mouseLastPosition = e.pageX;
  }
});
hueCanvas.addEventListener("mousedown",function(e){
  const newLeftPosition = e.pageX - hueCanvasPosition;
  if(newLeftPosition >= 0 && newLeftPosition <= 360){
    hueSliderBut.style.left = newLeftPosition - halfSliderSize + "px";
    selectedHue = newLeftPosition;
    fillSlSquare(selectedHue, selectedOpacity); 
  }
});

const opacitySliderBut = document.getElementById("opacity_slider_button");
let opacitySliderClicked = false;

opacitySliderBut.addEventListener( "mousedown",(e) => {
  e.preventDefault();
  mouseLastPosition = null;
  opacitySliderClicked = true;
});
addEventListener( "mouseup",() => opacitySliderClicked = false );

addEventListener("mousemove",function(e){
  if(opacitySliderClicked){
    const distanceMoved = e.pageY - (mouseLastPosition || e.pageY);
    let newOpacityValue = (selectedOpacity * opacityCanvas.height) + distanceMoved;
    if(newOpacityValue < 0){
      newOpacityValue = 0;
    }
    if(newOpacityValue > 200){
      newOpacityValue = 200;
    }
    opacitySliderBut.style.top = `${newOpacityValue - halfSliderSize}px`;
    selectedOpacity = newOpacityValue/200;
    fillSlSquare(selectedHue, selectedOpacity);
    mouseLastPosition = e.pageY;
  }
});
hueCanvas.addEventListener("mousedown",function(e){
  const newLeftPosition = e.pageX - hueCanvasPosition;
  if(newLeftPosition >= 0 && newLeftPosition <= 360){
    hueSliderBut.style.left = newLeftPosition - halfSliderSize + "px";
    selectedHue = newLeftPosition;
    fillSlSquare(selectedHue); 
  }
});