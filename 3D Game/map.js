function Map(width, height){
    this.width = width;
    this.height = height;

    var arr = new Array(height);
    for (var i = 0; i < arr.length; i++){
        arr[i] = new Array(width).fill(0);
    }

    this.grid = arr;
}
Map.prototype.get = function(x,y){
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x >= this.width - 1 || y < 0 || y >= this.height - 1) return -1;
    return this.grid[y][x];
}

Map.prototype.load = function(mapArray){
	this.width = mapArray[0].length;
	this.height = mapArray.length;
	
	this.grid = mapArray;
}