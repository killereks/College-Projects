var sinTable = [],
	cosTable = [],
	tanTable = [];

var accuracy = 0.1;

const toRad = Math.PI/180;
const toDeg = 180 / Math.PI;

for (var i = 0; i <= 361; i+=accuracy){
	sinTable.push(Math.sin(i*toRad));
}
for (var i = 0; i <= 361; i+=accuracy){
	cosTable.push(Math.cos(i*toRad));
}
for (var i = 0; i <= 361; i+=accuracy){
	tanTable.push(Math.tan(i*toRad));
}

function LerpValue(value1,value2,amount){
	return value1 + (value2 - value1) * amount;
}
function Percent(current, min,max){
	return ((current - min)) / (max - min);
}

function sin(value){
	// values are stored as [0,1,2,3,4,5,6,7,8,9,10]
	value %= Math.PI*2;
	var index = value * toDeg / accuracy;
	//indexFloored = Math.floor(index/accuracy)*accuracy
	
	return sinTable[Math.round(index)];
}

function cos(value){
	// values are stored as [0,1,2,3,4,5,6,7,8,9,10]
	value %= Math.PI*2;
	var index = value * toDeg / accuracy;
	//indexFloored = Math.floor(index/accuracy)*accuracy
	
	return cosTable[Math.round(index)];
}

function tan(value){
	// values are stored as [0,1,2,3,4,5,6,7,8,9,10]
	value %= Math.PI*2;
	var index = value * toDeg / accuracy;
	//indexFloored = Math.floor(index/accuracy)*accuracy
	
	return tanTable[Math.round(index)];
}