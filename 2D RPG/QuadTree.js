/*
USAGE:
// boundary is type of Rectangle,
// Rectangle is defined as x,y,w,h

// capacity is the number of elements for each subsection

var qt = new QuadTree(boundary, capacity)
// thing has to have x,y properties
qt.insert(thing);

// shape can either be Circle or Rectangle
// Circle is defined as (x,y,radius);
qt.query(shape);

*/

// This code has been written with help from
// QuadTree tutorial by Daniel Shiffman
// https://www.youtube.com/watch?v=OJxEcs0w_kE

class Point {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.userData = data;
  }
}

class Rectangle {
  constructor(x, y, w, h) {
	if (x == undefined) return console.warn("You need to specify the x coordinate");
    this.x = x;
	
	if (y == undefined) return console.warn("You need to specify the y coordinate");
    this.y = y;
	
	if (w == undefined) return console.warn("You need to specify the w coordinate");
    this.w = w;
	
	if (h == undefined) return console.warn("You need to specify the h coordinate");
    this.h = h;
  }

  contains(point) {
	point = point.position;
	
    return (point.x >= this.x - this.w &&
      point.x <= this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y <= this.y + this.h);
  }


  intersects(range) {
    return !(range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h);
  }
}

// circle class for a circle shaped query
class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.rSquared = this.r * this.r;
  }

  contains(point) {
	point = point.position;
    // check if the point is in the circle by checking if the euclidean distance of
    // the point and the center of the circle if smaller or equal to the radius of
    // the circle
    let d = Math.pow((point.x - this.x), 2) + Math.pow((point.y - this.y), 2);
    return d <= this.rSquared;
  }

  intersects(range) {

    let xDist = Math.abs(range.x - this.x);
    let yDist = Math.abs(range.y - this.y);

    // radius of the circle
    let r = this.r;

    let w = range.w;
    let h = range.h;

    let edges = Math.pow((xDist - w), 2) + Math.pow((yDist - h), 2);

    // no intersection
    if (xDist > (r + w) || yDist > (r + h))
      return false;

    // intersection within the circle
    if (xDist <= w || yDist <= h)
      return true;

    // intersection on the edge of the circle
    return edges <= this.rSquared;
  }
}

class QuadTree {
  constructor(boundary, capacity) {
    if (!boundary) {
      throw TypeError('boundary is null or undefined');
    }
    if (!(boundary instanceof Rectangle)) {
      throw TypeError('boundary should be a Rectangle');
    }
    if (typeof capacity !== 'number') {
      throw TypeError(`capacity should be a number but is a ${typeof capacity}`);
    }
    if (capacity < 1) {
      throw RangeError('capacity must be greater than 0');
    }
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  subdivide() {
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.w / 2;
    let h = this.boundary.h / 2;

    let ne = new Rectangle(x + w, y - h, w, h);
    this.northeast = new QuadTree(ne, this.capacity);
    let nw = new Rectangle(x - w, y - h, w, h);
    this.northwest = new QuadTree(nw, this.capacity);
    let se = new Rectangle(x + w, y + h, w, h);
    this.southeast = new QuadTree(se, this.capacity);
    let sw = new Rectangle(x - w, y + h, w, h);
    this.southwest = new QuadTree(sw, this.capacity);

    this.divided = true;
  }

  insert(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (this.northeast.insert(point) || this.northwest.insert(point) ||
      this.southeast.insert(point) || this.southwest.insert(point));
  }

  query(range, found) {
    if (!found) {
      found = [];
    }

    if (!range.intersects(this.boundary)) {
      return found;
    }

    for (let p of this.points) {
      if (range.contains(p)) {
        found.push(p);
      }
    }
    if (this.divided) {
      this.northwest.query(range, found);
      this.northeast.query(range, found);
      this.southwest.query(range, found);
      this.southeast.query(range, found);
    }

    return found;
  }
  copy(){
	  var q = new QuadTree(this.boundary,this.capacity);
	  for (var point of this.points){
		  q.insert(point);
	  }
	  return q;
  }
	
  delete(point){
	  var index = this.points.indexOf(point);
	  if (index > -1){
		  this.points.splice(index,1);
	  }
	  else {
		  if (point && this.northeast) this.northeast.delete(point);
		  if (point && this.northwest) this.northwest.delete(point);
		  if (point && this.southeast) this.southeast.delete(point);
		  if (point && this.southwest) this.southwest.delete(point);
	  }
  }
}