# colorPickerJs

A simple and easy to use color picker made with javascript.

##Demo

See **demo** at [live demo](https://stakvino.github.io/colorpicker/)
<img src="images/color-picker-domo.gif" />

##Integration

You can easily integrate this color picker by putting the color-picker-min.js and color-picker-min.css (availble in dist folder) in your project.

```javascript
<link rel="stylesheet" href="color-picker-min.css">
...
<script src="color-picker-min-export.js"></script>
<script>
  const colorPicker = new ColorPicker(); //create a color picker
  colorPicker.show(); //show the color picker
  
  //use the color on user input
  colorPicker.onInput(function(){
    console.log(colorPicker.selectedHex); //#ffffff
  });
</script>
```

or you can use es6 modules to import the file color-picker-min-export.js
```javascript
<link rel="stylesheet" href="color-picker-min.css">
...
<script type="module" src="color-picker-min-export.js"></script>
<script type="module">
  ...
</script>
```

##Usage

```javascript
const colorPicker = new ColorPicker(); //create a color picker
colorPicker.show(); //show the color picker

//Get the currently selected color from colorPicker as a string 
colorPicker.selectedHex; //#ffffff
colorPicker.selectedRgba; //rgba(255, 255, 255, 1)
colorPicker.selectedHsla; //hsla(360, 100%, 100%, 1)

//Add event handlers for the color picker
callback = () => console.log(colorPicker.selectedHex);

colorPicker.onInput(callback); //Callback will be executed whenever user change the color value

colorPicker.onSelect(callback); //Callback will be executed whenever user click on select button

colorPicker.onChange(callback); //Callback will be executed whenever user change color and click on any button that hides the color picker (select, close, cancel).

colorPicker.onCancel(callback); //Callback will be executed whenever user click on cancel button

colorPicker.onClose(callback); //Callback will be executed whenever user click on close button

//You can remove an event handeler by using methods with the same names prefixed with remove like so :
colorPicker.removeOnInput(callback); //Will remove callback from input event handlers stack
```


