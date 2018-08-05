const slCanvas = document.getElementById("sl_canvas");
const slCtx = slCanvas.getContext("2d");

const pixelSize = 3;
/*
for(let i = 0;i <= 100; i++){
  for(let j = 0;j <= 100; j++){
    slCtx.fillStyle = `hsl(${0},${j}%,${i}%)`;
    const x = (100 - i) * pixelSize;
    const y = (j * pixelSize);
    slCtx.fillRect(y,x,pixelSize,pixelSize);
  }
}
*/
const hueCanvas = document.getElementById("hue_canvas");
const hueCtx = hueCanvas.getContext("2d");

for(let i = 0;i <= 360; i++){
  hueCtx.fillStyle = `hsl(${i},100%,50%)`;
  hueCtx.fillRect(360 - i, 0, 1, 30);
}

const canvasTest = document.getElementById("test");
const ctx = canvasTest.getContext("2d");


ctx.lineWidth = 30;
const oneDegreeInRad = (Math.PI * 2)/360;

for(let i = 0; i <= Math.PI * 2; i+=oneDegreeInRad){
  const angleInDegree = Math.ceil(i / oneDegreeInRad);
  ctx.beginPath();
  ctx.strokeStyle = `hsl(${angleInDegree},100%,50%)`;
  ctx.arc(175, 175, 160, i, i + oneDegreeInRad);
  ctx.stroke();
}


function fillSlSquare(ctx, hue, opacity = 1, shift = 0, squareSize = 100){
  const pixelSize = 2;
  for(let i = 0;i <= squareSize; i++){
    for(let j = 0;j <= squareSize; j++){
      const saturation = j;
      const lightness  = i;
      ctx.fillStyle = `hsla(${hue},${saturation}%,${lightness}%,${opacity})`;
      const x = (j * pixelSize);
      const y = (squareSize - i) * pixelSize;
      ctx.fillRect(x + shift,y + shift,pixelSize,pixelSize);
    }
  }
}

fillSlSquare(ctx, 0, 1,  75);
fillSlSquare(slCtx, 0);

const opacityCanvas = document.getElementById("opacity_canvas");
const opacityCtx = opacityCanvas.getContext("2d");

for(let i = 0;i <= 200; i++){
  opacityCtx.fillStyle = `rgba(0,0,0,${i/200})`;
  opacityCtx.fillRect(0, i, 30, 2);
}
