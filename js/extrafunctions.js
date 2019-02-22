window.sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// The time has come to lay down my pride and face the fact javascript is single threaded.
window.busySleep = function (ms) {
    var now = new Date().getTime();
    while (new Date().getTime() < now + ms) {
        /* do nothing */ }
}

window.d2d3 = function (x1, y1, x2, y2, x3, y3) {
    return Math.abs((y2 - y1) * x3 - (x2 - x1) * y3 + x2 * y1 - y2 * x1) / Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
}
