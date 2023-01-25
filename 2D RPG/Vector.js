// Vector library to help with math

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        return this;
    }
    fromArray(arr) {
        this.x = arr[0];
        this.y = arr[1];

        return this;
    }
    fromAngle(magnitude, angle) {
        this.x = Math.cos(angle) * magnitude;
        this.y = Math.sin(angle) * magnitude;

        return this;
    }
    static fromAngle(magnitude, angle) {
        return new Vector(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
    }
    dot(v1) {
        if (v1) {
            return this.x * v1.x + this.y * v1.y;
        }
        return this.x * this.x + this.y * this.y;
    }
    magnitude() {
        return Math.sqrt(this.dot());
    }
    magnitudeSquared() {
        return this.dot();
    }
    static mult(v1, num) {
        return new Vector(v1.x * num, v1.y * num);
    }
    mult(v1) {
        if (v1 instanceof Vector) {
            return this.dot(v1);
        }
        return new Vector(this.x * v1, this.y * v1);
    }
    add(v1) {
        if (v1 instanceof Vector) {
            return new Vector(this.x + v1.x, this.y + v1.y);
        }
        return new Vector(this.x + v1, this.y + v1);
    }
    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }
    static addX(vector,x){
        return new Vector(vector.x+x,vector.y);
    }
    static addY(vector,y){
        return new Vector(vector.x,vector.y+y);
    }
    static subX(vector,x){
        return new Vector(vector.x-x,vector.y);
    }
    static subY(vector,y){
        return new Vector(vector.x,vector.y-y);
    }
    sub(v1) {
        if (v1 instanceof Vector) {
            return new Vector(this.x - v1.x, this.y - v1.y);
        }
        return new Vector(this.x - v1, this.y - v1);
    }
    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }
    div(v1) {
        if (v1 instanceof Vector) {
            return new Vector(this.x / v1.x, this.y / v1.y);
        }
        return new Vector(this.x / v1, this.y / v1);
    }
    normalized() {
        var mag = this.magnitude();
        return this.div(mag);
    }
    angle(v1) {
        // cos x = (a•b) / ( |a||b| )
        var dot = this.dot(v1);
        var mag = this.magnitude() * v1.magnitude();

        return Math.acos(dot / mag);
    }
    print() {
        console.log("X: " + this.x + ", Y: " + this.y);
    }
    normalClockwise() {
        return new Vector(this.y, -this.x);
    }
    normalAntiClockwise() {
        return new Vector(-this.y, this.x);
    }
    static lerp(v1, v2, perc) {
        var x = v1.x + (v2.x - v1.x) * perc;
        var y = v1.y + (v2.y - v1.y) * perc;
        return new Vector(x, y);
    }
    equals(v1) {
        return this.x == v1.x && this.y == v1.y;
    }
    static distance(v1, v2) {
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    clamp(minx, maxx, miny, maxy) {
        if (this.x < minx) this.x = minx;
        if (this.x > maxx) this.x = maxx;

        if (this.y < miny) this.y = miny;
        if (this.y > maxy) this.y = maxy;
    }
    setMagnitude(mag) {
        var myMag = this.magnitude();
        this.x *= mag / myMag;
        this.y *= mag / myMag;
    }
    positive() {
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
    }
    heading() {
        return Math.atan2(this.y, this.x);
    }
    // random within a square
    static random(mag) {
        var x = Math.random() * 2 * mag - mag;
        var y = Math.random() * 2 * mag - mag;

        return new Vector(x, y);
    }
    // always the same length but random around the circle
    static randomUniform(mag){
        var angle = Math.random() * 2 * Math.PI;
        var x = Math.cos(angle) * mag;
        var y = Math.sin(angle) * mag;
        return new Vector(x,y);
    }
    // random around a circle (non-uniform)
    static randomCircle(mag) {
        mag = Math.random() * mag;
        var theta = Math.random() * Math.PI * 2;
        // I am aware that for a uniform circular distrubution i need
        // to square root the random (0-1) but for performance
        // reasons I am not using a square root here
        // ironically i need to use cos, sin
        var x = Math.cos(theta) * mag;
        var y = Math.sin(theta) * mag;

        return new Vector(x, y);
    }
    round(dp){
        this.x = ((this.x / dp) | 0) * dp;
        this.y = ((this.y / dp) | 0) * dp;
    }
}
