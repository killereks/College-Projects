var Input = {
  keys: [],
  keysOneFrame: [],
  mousePosition: {x: 0,y: 0},
  mouseBtn: [false,false,false],
  GetKey: function(key){
    return this.keys.indexOf(key) != -1;
  },
  // 0 = left
  // 1 = middle
  // 2 = right
  GetMouseButton: function(btn){
    return this.mouseBtn[btn];
  }
}
document.addEventListener("keydown",function(event){
  if (Input.keys.indexOf(event.key.toLowerCase()) == -1){
    Input.keys.push(event.key.toLowerCase());
  }
})
document.addEventListener("keyup",function(event){
  if (Input.keys.indexOf(event.key.toLowerCase()) != -1){
    Input.keys.splice(Input.keys.indexOf(event.key.toLowerCase()),1);
  }
})
document.addEventListener("mousemove",function(event){
  var rect = canvas.getBoundingClientRect();
  Input.mousePosition = {x: event.x - rect.left,y: event.y - rect.top};
})
document.addEventListener("mousedown",function(event){
  Input.mouseBtn[event.button] = true;
})
document.addEventListener("mouseup",function(event){
  Input.mouseBtn[event.button] = false;
})
document.oncontextmenu = function(event){
  return false;
}