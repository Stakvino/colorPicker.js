const chooseColorBut = document.getElementById("choose_color");
const colorPicker = new ColorPicker();

chooseColorBut.addEventListener("click", () => {
  colorPicker.show();
});

const input_block = document.querySelector("div.on-input");
colorPicker.onInput(function(){
  input_block.style.backgroundColor = colorPicker.selectedHsla;
});

const select_block = document.querySelector("div.on-select");
colorPicker.onSelect(function(){
  select_block.style.backgroundColor = colorPicker.selectedHsla;
  select_block.classList.add("flash-animation");
  setTimeout(() => select_block.classList.remove("flash-animation"), 600);
});

const change_block = document.querySelector("div.on-change");
colorPicker.onChange(function(){
  change_block.style.backgroundColor = colorPicker.selectedHsla;
  change_block.classList.add("flash-animation");
  setTimeout(() => change_block.classList.remove("flash-animation"), 600);
});
