class Vector {
  constructor(x,y,z){
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    
    return this;
  }
  static add(v1,v2){
    return new Vector(v1.x+v2.x,v1.y+v2.y,v1.z+v2.z);
  }
  static sub(v1,v2){
    return new Vector(v1.x-v2.x,v1.y-v2.y,v1.z-v2.z);
  }
  static mult(v1,scalar){
    return new Vector(v1.x * scalar, v1.y * scalar, v1.z * scalar);
  }
  
  static div(v1,scalar){
    return Vector.mult(v1,1/scalar);
  }
  
  static distance(v1,v2){
    var dx = v1.x - v2.x,
        dy = v1.y - v2.y;
    return Math.sqrt(dx*dx+dy*dy);
  }
  
  static normalize(v1){
    var mag = 1/v1.magnitude();
    return new Vector(v1.x*mag,v1.y*mag,v1.z*mag);
  }
  
  magnitude(){
    return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
  }
  magnitudeSquared(){
    return this.x*this.x + this.y*this.y + this.z*this.z;
  }
  
  heading(){
    return Math.atan2(this.y,this.x);
  }
  
  setMag(num){
    num = num || 1;
    this.mult(num/this.mag());
    return this;
  }
  
  static dot(v1,v2){
    return (v1.x*v2.x+v1.y*v2.y+v1.z*v2.z);
  }
  dot(vector){
	  return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  }
  
  angle(vector){
    return Math.acos((this.dot(vector))/(this.magnitude() * vector.magnitude()));
  }
  
  reverse(a,b,c){
    if (a == null && b == null && c == null){
      this.mult(-1);
      return this;
    } else{
      if (a){
        this.x *= -1;
      }
      if (b){
        this.y *= -1;
      }
      if (c){
        this.z *= -1;
      }
      return this;
    }
  }
  
  randomize(min,max){
    min = min || 1;
    max = max || 10;
    this.x = Math.floor((Math.random() * (max - min)) + min);
    this.y = Math.floor((Math.random() * (max - min)) + min);
    this.z = Math.floor((Math.random() * (max - min)) + min);
    return this;
  }
  
  copy(){
    return new Vector(this.x,this.y,this.z);
  }
  
  static fromAngle(mag,angle){
    var x = mag * Math.cos(angle);
    var y = mag * Math.sin(angle);
    return new Vector(x,y,0);
  }
  
  print(){
    console.log(`X: ${this.x}, Y: ${this.y}, Z: ${this.z}`);
  }
  
  static cross(v1,v2){
    var x = v1.y * v2.z - v1.z * v2.y;
    var y = v1.z * v2.x - v1.x * v2.z;
    var z = v1.x * v2.y - v1.y * v2.x;
    
    return new Vector(x,y,z);
  }
  
  set(a,b,c){
    this.x = a || this.x;
    this.y = b || this.y;
    this.z = c || this.z;
  }
  
  static Lerp(pos1,pos2,smooth){
    //return pos1 + smooth * (pos2 - pos1);
    var _x = pos1.x + smooth * (pos2.x - pos1.x),
        _y = pos1.y + smooth * (pos2.y - pos1.y),
        _z = pos1.z + smooth * (pos2.z - pos1.z);
    
    return new Vector(_x,_y,_z);
  }
  
  static Slerp(pos1,pos2,smooth){
    var _x = pos1.x + smooth * smooth * (pos2.x - pos1.x),
        _y = pos1.y + smooth * smooth * (pos2.y - pos1.y),
        _z = pos1.z + smooth * smooth * (pos2.z - pos1.z);
    
    return new Vector(_x,_y,_z);
  }
}