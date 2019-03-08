var elementFocusLock = null;
var isDragEntity = (ent) => {
    return ent === elementFocusLock && ent.isDragging;
}

class StateElementGUI {
    constructor(symbol, isAccepting, isStarting, {
        x,
        y,
        radius,
        index
    }, env) {
        this.symbol      = symbol;
        this.isAccepting = isAccepting;
        this.isStarting  = isStarting;
        this.x           = x;
        this.y           = y;
        this.radius      = radius;
        this.index       = index
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
            drawArrow(sx, sy, env.HALF_PI, offset, env);
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
    constructor(symbol, stateFrom, stateTo, direction, needsOffset, env) {
        this.symbol      = symbol;
        this.stateFrom   = stateFrom;
        this.stateTo     = stateTo;
        this.direction   = direction;
        this.needsOffset = needsOffset;
        this.env         = env;
        this.color       = [80, 80, 80];
        this.textColor   = [255, 255, 255];
       this.thickness   = 15;
        this.isDragging  = false;
        this.isLoop      = stateTo === stateFrom;
        this.offset      = {
            x: 0,
            y: 0
        };
    }

    isMouseOver() {
        // Over complicate the way to calculate if you are hovering a transistion line
        // HIGH SCHOOL MATHS TO THE EXTREME BOYS - IT WORKS BTW
        let env  = this.env;
        let sf_x = this.stateFrom.x + this.offset.x;
        let sf_y = this.stateFrom.y + this.offset.y;
        let st_x = this.stateTo.x   + this.offset.x;
        let st_y = this.stateTo.y   + this.offset.y;

        let d      = d2d3(sf_x, sf_y, st_x, st_y, env.mouseX, env.mouseY);
        let e1dist = env.dist(sf_x, sf_y, env.mouseX, env.mouseY);
        let e2dist = env.dist(st_x, st_y, env.mouseX, env.mouseY);
        let rdist  = env.dist(sf_x, sf_y, st_x, st_y);

        return (e1dist <= rdist) && (e2dist <= rdist) && (d < this.thickness/2);
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

        // Calculate offset :)
        let coord_offset = 15;
        this.offset = {
            x: this.needsOffset ? coord_offset : 0,
            y: this.needsOffset ? coord_offset : 0,
        };

        if (this.needsOffset && this.direction == TransistionElementGUI.BACKWARD) {
            this.offset.x *= -1;
            this.offset.y *= -1
        }

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

        // line properties
        env.strokeWeight(this.thickness);

        if(this.isMouseOver())
            env.stroke(140, 90, 90);
        else
            env.stroke(...this.color);

        // line or loop :)
        if (this.isLoop) {
            let loop_width  = 90;
            let loop_height = 270;

            env.noFill();
            env.arc(sf_x, sf_y, loop_width, loop_height, 0, env.PI); // sf_x == st_x same for y so doesnt matter which
            env.fill(255);
            env.strokeWeight(1);
        } else { // line boys!
            env.line(sf_x, sf_y, st_x, st_y);
            env.strokeWeight(1);

            // arrow point
            var offset = 14;
            env.fill(5, 5, 5);

            // Draw arrow head
            drawArrow(midpoint.x, midpoint.y, env.atan2(sf_y - st_y, sf_x - st_x) - env.HALF_PI, offset, env);
        }

        // Text
        env.fill(...this.textColor);
        env.textFont(env.NORMAL_FONT);
        env.textSize(60);

        let extra = this.isLoop ? 45 : 10;
        let tw    = env.textWidth(this.symbol);
        let th    = env.textSize(this.symbol) + extra;

        if(!this.isLoop && this.needsOffset && this.direction === TransistionElementGUI.BACKWARD)
            th *= -.4;

        env.text(this.symbol, midpoint.x - tw / 2, midpoint.y + th);
    }

    highlight(color) {
        this.color = color;
        //console.log("Highlight color changed to: ", color);
    }
}

TransistionElementGUI.FORWARD  = 1;
TransistionElementGUI.BACKWARD = 2;