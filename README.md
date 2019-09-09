# colorPickerJs

A simple and easy to use color picker made with javascript.

## Demo

See **demo** at [live demo](https://stakvino.github.io/colorpicker/)
![alt text](https://raw.githubusercontent.com/Stakvino/colorPickerJs/master/images/color-picker-demo.gif)

## Integration

You can easily integrate this color picker by putting the color-picker-min.js and color-picker-min.css (availble in dist folder) in your project.

```html
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
```html
<link rel="stylesheet" href="color-picker-min.css">
...
<script type="module" src="color-picker-min-export.js"></script>
<script type="module">
  ...
</script>
```

## Usage

Create and show a color picker 
```javascript
const colorPicker = new ColorPicker(); //create a color picker
colorPicker.show(); //show the color picker
```

Get the currently selected color from colorPicker as a string 
```javascript
colorPicker.selectedHex; //#ffffff
colorPicker.selectedRgba; //rgba(255, 255, 255, 1)
colorPicker.selectedHsla; //hsla(360, 100%, 100%, 1)
```

Add event handlers for the color picker
```javascript
callback = () => console.log(colorPicker.selectedHex);

//Callback will be executed whenever user change the color value
colorPicker.onInput(callback); 

//Callback will be executed whenever user click on select button
colorPicker.onSelect(callback); 

//Callback will be executed whenever user change color and click on any button that hides the color picker.
colorPicker.onChange(callback); 

//Callback will be executed whenever user click on cancel button
colorPicker.onCancel(callback); 

//Callback will be executed whenever user click on close button
colorPicker.onClose(callback); 
```

You can remove an event handeler by using methods with the same names prefixed by "remove" like so :
```javascript
//Will remove callback from input event handlers stack
colorPicker.removeOnInput(callback); 
```


