window.sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// The time has come to lay down my pride and face the fact javascript is single threaded.
window.busySleep = function (ms) {
    var now = new Date().getTime();
    while (new Date().getTime() < now + ms) {
        /* do nothing */
    }
}

window.d2d3 = function (x1, y1, x2, y2, x3, y3) {
    return Math.abs((y2 - y1) * x3 - (x2 - x1) * y3 + x2 * y1 - y2 * x1) / Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
}

window.curveBetween = function (env, x1, y1, x2, y2, d, h, flip) {
    //find two control points off this line
    var original = p5.Vector.sub(createVector(x2, y2), createVector(x1, y1));
    var inline   = original.copy().normalize().mult(original.mag() * d);
    var rotated  = inline.copy().rotate(radians(90) + flip * radians(180)).normalize().mult(original.mag() * h);
    var p1       = p5.Vector.add(p5.Vector.add(inline, rotated), createVector(x1, y1));

    //line(x1, y1, p1.x, p1.y); //show control line
    rotated.mult(-1);
    var p2 = p5.Vector.add(p5.Vector.add(inline, rotated).mult(-1), createVector(x2, y2));

    //line(x2, y2, p2.x, p2.y); //show control line
    bezier(x1, y1, p1.x, p1.y, p2.x, p2.y, x2, y2)
}