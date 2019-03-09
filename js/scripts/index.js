// Global Variable for the visualised FSM entity & Accept function promise.
var fsm           = null;
var acceptPromise = null;

// Default Values - Configurable in settings popup
const SETTINGS = {
    sleep_interval           : 700,
    state_element_color      : [240, 240, 240],
    state_text_color         : [255, 255, 255],
    state_text_size          : 80,
    state_radius             : 100,
    transition_element_color : [80, 80, 80],
    transition_text_color    : [255, 255, 255],
    transistion_text_size    : 60,
    transition_thickness     : 15,
}

// Page core elements
let generateButton = document.getElementById("generate");
let acceptButton   = document.getElementById("accept");
let acceptInput    = document.getElementById("accept-input");
let settingsButton = document.getElementById("settings-button");

// Generator elements
let generator            = document.getElementById('generator');
let generatorContent     = document.getElementById("generator-content");
let closeGeneratorButton = document.getElementById("generator-close");
let fsmSelect            = document.getElementById("generator-fsm-select");
let alphabetInput        = document.getElementById("generator-alphabet-input");
let statesInput          = document.getElementById("generator-states-input");
let startingStateInput   = document.getElementById("generator-startingstate-input");
let acceptingStateInput  = document.getElementById("generator-acceptingstate-input");
let generateFSMButton    = document.getElementById("generator-generate-fsm");
let transitionElement    = document.getElementById("generator-transition-element");

// Settings elements
let settings                    = document.getElementById("settings");
let settingsContent             = document.getElementById("settings-content");
let closeSettingsButton         = document.getElementById("settings-close");
let speedInput                  = document.getElementById("settings-speed-input");
let stateRadiusInput            = document.getElementById("settings-state-radius");
let stateElementColorInput      = document.getElementById("settings-state-element-color");
let stateTextColorInput         = document.getElementById("settings-state-text-color");
let stateTextSizeInput          = document.getElementById("settings-state-text-size");
let transitionElementColorInput = document.getElementById("settings-transition-element-color");
let transitionTextColorInput    = document.getElementById("settings-transition-text-color");
let transitionTextSizeInput     = document.getElementById("settings-transition-text-size");
let transitionThicknessInput    = document.getElementById("settings-transition-thickness");
let settingsSaveButton          = document.getElementById("settings-save");

/******************************
 *      Page Logic
******************************/

settingsButton.onclick = function () {
    settings.style.display = "block";
};

generateButton.onclick = function () {
    generator.style.display = "block";
    acceptButton.className  = "hvr-underline-from-center pure-button button-accept";
    acceptInput.className   = "accept-input";

    updateTransistionTable();
};

acceptButton.onclick = function () {
    if (fsm === null) {
        alert("Must generate a FSM first!");
        return;
    }

    acceptPromise = fsm.accept(acceptInput.value).then((r) => (console.log(r) || true) && alert(`Accepted: ${r.accepted}\nMessage: ${r.message}`));
};

/******************************
 *      Settings Logic
******************************/
// Load Defaults

(function (){
    speedInput.value                  = SETTINGS.sleep_interval;
    stateRadiusInput.value            = SETTINGS.state_radius;
    stateTextSizeInput.value          = SETTINGS.state_text_size;
    stateElementColorInput.value      = rgbToHex(...SETTINGS.state_element_color);
    stateTextColorInput.value         = rgbToHex(...SETTINGS.state_text_color);
    transitionElementColorInput.value = rgbToHex(...SETTINGS.transition_element_color);
    transitionTextColorInput.value    = rgbToHex(...SETTINGS.transition_text_color);
    transitionTextSizeInput.value     = SETTINGS.transistion_text_size;
    transitionThicknessInput.value    = SETTINGS.transition_thickness;
})();

// Event Functions
closeSettingsButton.onclick = async function () {
    settingsContent.classList.add("slide-out");
    await setTimeout(() => { settings.style.display = "none";  settingsContent.classList.remove("slide-out")}, 600);
};

settingsSaveButton.onclick = function () {
    SETTINGS.sleep_interval           = Number(speedInput.value);
    SETTINGS.state_radius             = Number(stateRadiusInput.value);
    SETTINGS.state_text_size          = Number(stateTextSizeInput.value);
    SETTINGS.state_element_color      = hexToRgb(stateElementColorInput.value);
    SETTINGS.state_text_color         = hexToRgb(stateTextColorInput.value);
    SETTINGS.transition_element_color = hexToRgb(transitionElementColorInput.value);
    SETTINGS.transition_text_color    = hexToRgb(transitionTextColorInput.value)
    SETTINGS.transistion_text_size    = Number(transitionTextSizeInput.value);
    SETTINGS.transition_thickness     = Number(transitionThicknessInput.value);

    settings.style.display = "none";
};

/******************************
 *      Generator Logic
******************************/

// Biggest mess ever created BUT HEY IT WORKS FAM
let transition = {}; // { '1' = { 'a' : [el1, el2], ... } }
let updateTransistionTable = function () {
    let alphabet = [];
    let states   = [];

    // parse alphabet
    let alphabetString = alphabetInput.value.trim();

    if (alphabetString.indexOf(' ') >= 0)
        return alert("Please do not have spaces in alphabet string input!");

    alphabet = alphabetString.split(',');

    // parse states
    let statesString = statesInput.value.trim();

    if (statesString.indexOf(' ') >= 0)
        return alert("Please do not have spaces in states string input!");

    states = statesString.split(',');

    // Delete current child elements
    while (transitionElement.firstChild) {
        transitionElement.removeChild(transitionElement.firstChild);
    }

    let createStateTransitionElement = function (div, state, symbol){
        let stateTransitionInputElement = document.createElement("div");
        stateTransitionInputElement.classList.add('transition-table-row-element');

        let label           = document.createElement("p");
        label.innerHTML     = `Symbol: '${symbol}'`;
        label.style.margin  = 0;
        label.style.marginLeft = "2%";
        let inputElement    = document.createElement("input");
        inputElement.classList.add('transition-table-row-element-input');

        stateTransitionInputElement.appendChild(label);
        stateTransitionInputElement.appendChild(inputElement);

        div.appendChild(stateTransitionInputElement);
        return inputElement;
    }

    for (let state of states) {
        transition[state] = { };
        let div = document.createElement("div");
        div.classList.add('transition-table-row');
        let label = document.createElement("h3");
        label.innerHTML = "Transition function for " + state;
        label.style.textAlign = "center";
        div.appendChild(label);
        for (let symbol of alphabet) {
            transition[state][symbol] = createStateTransitionElement(div, state, symbol);
        }
        transitionElement.appendChild(div);
    }

    console.log(transition);
}
 
closeGeneratorButton.onclick = async function () {
    //generator.style.display = "none";
    generatorContent.classList.add("slide-out");
    await setTimeout(() => { generator.style.display = "none";  generatorContent.classList.remove("slide-out")}, 600);
    if (fsm) return; // so that we can continue to test input on current DFA
    acceptButton.className = "hvr-underline-from-center pure-button button-accept pure-button-disabled";
    acceptInput.className  = "accept-input input-disable";
};

generateFSMButton.onclick = function () {
    let fsmType             = fsmSelect.value;
    let fsmConstructor      = window[fsmType]; // LMAO - YOU DID NOT SEE THIS - MOVE A LONG - NOTHING HERE
    let alphabet            = [];
    let states              = {};
    let startingStateSymbol = "";

    console.log(">>>>", fsmConstructor, fsmType);

    if (typeof fsmConstructor === "undefined")
        return alert("Invalid FSM Selected!");

    // parse alphabet
    let alphabetString = alphabetInput.value.trim();

    if (alphabetString.indexOf(' ') >= 0)
        return alert("Please do not have spaces in alphabet string input!");

    alphabet = alphabetString.split(',');

    if (alphabet.length[0] === "")
        return alert("The FSM must have a non empty alphabet set.");

    // parse states
    let statesString = statesInput.value.trim();

    if (statesString.indexOf(' ') >= 0)
        return alert("Please do not have spaces in states string input!");

    let statesArray = statesString.split(',');

    if (statesArray[0] === "")
        return alert("The FSM must have a non empty states set.");

    for (let stateSymbol of statesArray) {
        states[stateSymbol] = {
            transition : { },
            accepting : false,
        }
    }

    // starting state
    startingStateSymbol = startingStateInput.value.trim();

    if (startingStateSymbol === "")
        return alert("There must be one starting state!");

    // accepting states
    let acceptingStateString = acceptingStateInput.value.trim();

    if (acceptingStateString.indexOf(' ') >= 0)
        return alert("Please do not have spaces in states string input!");

    let acceptingStatesArray = acceptingStateString.split(',');

    if (acceptingStatesArray[0] === "")
        return alert("The FSM must have at least one accepting state!");

    for (let acceptingStateSymbol of acceptingStatesArray) {
        states[acceptingStateSymbol].accepting = true;
    }

    // transition
    let transitionData = transition;

    for (let stateSymbol in transitionData) {
        let transitionElement = transitionData[stateSymbol];
        for (let transitionSymbol in transitionElement) {
            let inputElement = transitionElement[transitionSymbol];
            if (inputElement.value === "")
                continue;
            console.log(inputElement.value);
            states[stateSymbol].transition[transitionSymbol] = inputElement.value.split(',');
        }
    }

    console.log(states);

    // Finally, initialise fsm object
    fsm = new fsmConstructor(
        alphabet,
        states,
        startingStateSymbol
    );

    generator.style.display = "none";
};

alphabetInput.onblur = updateTransistionTable;
statesInput.onblur   = updateTransistionTable;
