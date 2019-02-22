var fsm = null; // initialised in index.js

// Instance mode because project is bigger in scope
var environment = function (env) {
    env.vars = {
        backgroundColor : [40, 40, 40],
        elementColor    : [255, 255, 255],
        no_fsm_message  : "No FSM Generated!",
        fontsize        : 200,
    };

    env.preload = function () {
        // is loaded before setup() and draw() are called
        env.CAPS_FONT   = env.loadFont('../assets/fonts/BebasNeue-Bold.otf');
        env.NORMAL_FONT = env.loadFont('../assets/fonts/Montserrat-Light.otf');
    }
      
    env.setup = function (w = window.innerWidth, h = window.innerHeight) {
        // Set text characteristics
        env.textFont(env.CAPS_FONT);
        env.textSize(env.vars.fontsize);
        env.textAlign(env.CENTER, env.CENTER);
        
        // Create canvas
        env.createCanvas(w / 1.009, h / 1.082); // okay p5!
    }

    env.noFSMSelectedDraw = function () {
        env.background(env.vars.backgroundColor);
        env.fill(...env.vars.elementColor);

        let tw = env.textWidth(env.vars.no_fsm_message);
        let th = env.textSize(env.vars.no_fsm_message);
        env.text(env.vars.no_fsm_message, env.width/2 - tw/2, env.height/2 + th/2);
    }

    env.draw = function () {
        if (fsm === null) {
            env.noFSMSelectedDraw();
            return;
        }

        env.background(env.vars.backgroundColor);   
        fsm.setup(env).draw(); // setup returns fsm after 1st call - questionable design choices paulo!
    }

    env.callEventFunctions = function (id) {
        let mx = env.mouseX;
        let my = env.mouseY;

        let stateElements      = fsm.GUIElement.states;
        let transitionElements = fsm.GUIElement.transitions;

        // states
        for (let stateSymbol in stateElements) {
            let stateElement = stateElements[stateSymbol];
            stateElement[id](mx, my);
        }

        // transitions
        for (let transition of transitionElements) {
            transition[id](mx, my);
        }
    }

    env.mouseReleased = function () {
        if (fsm === null) 
            return;
        env.callEventFunctions("mouseReleased");
    }

    env.mousePressed = function () {
        if (fsm === null || !fsm.GUIElement) 
            return;
        env.callEventFunctions("mousePressed");
    }
}

// Initialise canvas to div.
let canvasElement = document.getElementById("sketch-holder");
var canvas        = new p5(environment, canvasElement);

// Resize canvas when w/h changed! (may restart animation)
window.onresize = function () {
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.setup(w, h)
};