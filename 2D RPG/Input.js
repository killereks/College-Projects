// Input manager to make it easier in-game

var Input = {
  keys: [],
  mousePosition: new Vector(0,0),
  mouseBtn: [false,false,false],
  GetKey: function(key){
    return this.keys.indexOf(key) != -1;
  },
  // 0 = left
  // 1 = middle
  // 2 = right
  GetMouseButton(btn){
    return this.mouseBtn[btn];
  }
}
document.addEventListener("keydown",function(event){
  if (Input.keys.indexOf(event.key) == -1){
    Input.keys.push(event.key);
  }
})
document.addEventListener("keyup",function(event){
  if (Input.keys.indexOf(event.key) != -1){
    Input.keys.splice(Input.keys.indexOf(event.key),1);
  }
})
document.addEventListener("mousemove",function(event){
  var rect = canvas.getBoundingClientRect();
  Input.mousePosition = new Vector(event.x - rect.left,event.y - rect.top);
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