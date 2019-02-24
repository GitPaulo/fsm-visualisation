var elementFocusLock = null;
var isDragEntity = (ent) => {
    return ent === elementFocusLock && ent.isDragging;
}

class StateElementGUI {
    constructor(symbol, isAccepting, isStarting, {
        x,
        y,
        radius
    }, env) {
        this.symbol      = symbol;
        this.isAccepting = isAccepting;
        this.isStarting  = isStarting;
        this.x           = x;
        this.y           = y;
        this.radius      = radius;
        this.isDragging  = false;
        this.env         = env;
        this.color       = [240, 240, 240];
        this.textColor   = [255, 255, 255];
    }

    /* Check if mouse is over */
    isMouseOver() {
        // im lazy
        let env = this.env;
        
        return env.dist(env.mouseX, env.mouseY, this.x, this.y) <= this.radius / 2;
    }

    /* Called when mouse is released */
    mouseReleased(mx, my) {
        // im lazy
        let env = this.env;

        this.isDragging  = false;
        elementFocusLock = null;
    }

    /* Called when mouse is pressed! */
    mousePressed(mx, my) {
        // im lazy
        let env = this.env;

        if (this.isMouseOver()) {
            this.isDragging  = true;
            elementFocusLock = this;
        }
    }

    draw() {
        // im lazy
        let env = this.env;

        env.stroke(127, 63, 120);

        if (isDragEntity(this)) {
            this.x = env.mouseX;
            this.y = env.mouseY;
        }

        if (this.isStarting) {
            // arrow point
            let sx = this.x - this.radius;
            let sy = this.y;

            var offset = 30;
            env.fill(225, 95, 45);

            // Draw arrow head
            env.push() //start new drawing state
                env.translate(sx, sy); //translates to the destination vertex
                env.rotate(env.HALF_PI); //rotates the arrow point
                env.triangle(-offset * 0.5, offset, offset * 0.5, offset, 0, -offset / 2); //draws the arrow point as a triangle
            env.pop();
        }

        if (this.isAccepting) {
            env.fill(140, 240, 140);
            let r = this.radius + 20;
            env.ellipse(this.x, this.y, r, r);
        }

        if (this.isMouseOver())
            env.fill(150, 150, 150);
        else
            env.fill(...this.color);

        env.ellipse(this.x, this.y, this.radius, this.radius);

        env.textFont(env.CAPS_FONT);
        env.fill(24, 24, 24);
        env.textSize(80);

        let tw = env.textWidth(this.symbol);
        let th = env.textSize(this.symbol);
        env.text(this.symbol, this.x - tw / 2, this.y + th / 2.8);
    }

    highlight(color) {
        this.color = color;
        //console.log("Highlight color changed to: ", color);
    }
}

class TransistionElementGUI {
    constructor(symbol, stateFrom, stateTo, env) {
        this.symbol     = symbol;
        this.stateFrom  = stateFrom;
        this.stateTo    = stateTo;
        this.env        = env;
        this.color      = [80, 80, 80];
        this.textColor  = [255, 255, 255];
        this.offset     = { x:0, y:0 };
        this.thickness  = 15;
        this.isDragging = false;
    }

    isMouseOver() {
        // im lazy
        let env = this.env;
        let sf_x = this.stateFrom.x + this.offset.x;
        let sf_y = this.stateFrom.y + this.offset.y;
        let st_x = this.stateTo.x   + this.offset.x;
        let st_y = this.stateTo.y   + this.offset.y;

        let d = d2d3(sf_x, sf_y, st_x, st_y, env.mouseX, env.mouseY);

        return d < this.thickness/2;
    }

    /* Called when mouse is released */
    mouseReleased(mx, my) {
        /*// im lazy
        let env = this.env;

        this.isDragging = false;
        elementFocusLock    = null;*/
    }

    /* Called when mouse is pressed! */
    mousePressed(mx, my) {
        /*// im lazy
        let env = this.env;
        if (this.isMouseOver()) {
            this.isDragging = true;
            elementFocusLock= this;
        }*/
    }

    draw() {
        // im lazy
        let env = this.env;

        // points
        let sf_x = this.stateFrom.x + this.offset.x;
        let sf_y = this.stateFrom.y + this.offset.y;
        let st_x = this.stateTo.x   + this.offset.x;
        let st_y = this.stateTo.y   + this.offset.y;

        // midpoint
        let midpoint = {
            x: (sf_x + st_x) / 2,
            y: (sf_y + st_y) / 2,
        }

        // line color
        //console.log(this.isMouseOver());
        if(this.isMouseOver())
            env.stroke(140, 90, 90);
        else
            env.stroke(...this.color);

        // line  
        env.strokeWeight(this.thickness);
        env.line(sf_x, sf_y, st_x, st_y);
        env.strokeWeight(1);

        // arrow point
        var offset = 14;
        env.fill(5, 5, 5);

        // Draw arrow head
        env.push() //start new drawing state
            var angle = env.atan2(sf_y - st_y, sf_x - st_x); //gets the angle of the line
            env.translate(midpoint.x, midpoint.y); //translates to the destination vertex
            env.rotate(angle - env.HALF_PI); //rotates the arrow point
            env.triangle(-offset * 0.5, offset, offset * 0.5, offset, 0, -offset / 2); //draws the arrow point as a triangle
        env.pop();

        // Text
        let tw = env.textWidth(this.symbol);
        let th = env.textSize(this.symbol);

        env.textFont(env.NORMAL_FONT);
        env.fill(...this.textColor);
        env.textSize(80);
        env.text(this.symbol, midpoint.x - tw / 2, midpoint.y + th + 10);
    }

    highlight(color) {
        this.color = color;
        //console.log("Highlight color changed to: ", color);
    }
}