// Global Variable for the visualised FSM entity!
var fsm = null;

// page core elements
let generateButton = document.getElementById("generate");
let acceptButton   = document.getElementById("accept");
let acceptInput    = document.getElementById("accept-input");
let popup          = document.getElementById('generate-popup');
let span           = document.getElementsByClassName("close")[0];

// generator field elements
let fsmSelect           = document.getElementById("fsm-select");
let alphabetInput       = document.getElementById("alphabet-input");
let statesInput         = document.getElementById("states-input");
let startingStateInput  = document.getElementById("starting-state-input");
let acceptingStateInput = document.getElementById("accepting-state-input");
let generateFSMButton   = document.getElementById("generate-fsm");
let transitionElement   = document.getElementById("transition-element");

/***************
 * Page Logic
***************/

generateButton.onclick = function (params) {
    popup.style.display    = "block";
    acceptButton.className = "hvr-underline-from-center pure-button button-accept";
    acceptInput.className  = "accept-input";
    updateTransistionTable();
}

var acceptPromise;
acceptButton.onclick = function (params) {
    if (fsm === null) {
        alert("Must generate FSM first!");
        return;
    }
    acceptPromise = fsm.accept(acceptInput.value).then((r) => (console.log(r) || true) && alert(`Accepted: ${r.accepted}\nMessage: ${r.message}`));
}

/*******************
 * Generator Logic
********************/

// Biggest mess ever created BUT HEY IT WORKS FAM
let transition = {}; // { '1' = { 'a' : [el1, el2], ... } }
let updateTransistionTable = function () {
    let alphabet = [];
    let states   = [];

    // parse alphabet
    let alphabetString = alphabetInput.value.trim();

    if (alphabetString.indexOf(' ') >= 0)
        throw "Please do not have spaces in alphabet string input!";
    
    alphabet = alphabetString.split(',');

    // parse states
    let statesString = statesInput.value.trim();

    if (statesString.indexOf(' ') >= 0)
        throw "Please do not have spaces in states string input!";
    
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

span.onclick = function () {
    popup.style.display = "none";
    if (fsm) return; // so that we can continue to test input on current DFA
    acceptButton.className = "hvr-underline-from-center pure-button button-accept pure-button-disabled";
    acceptInput.className  = "accept-input input-disable";
}

alphabetInput.onblur = function () {
    updateTransistionTable();
}

statesInput.onblur = function () {
    updateTransistionTable();
}

generateFSMButton.onclick = function () {
    let fsmType        = fsmSelect.value;
    let fsmConstructor = window[fsmType]; // LMAO - YOU DID NOT SEE THIS - MOVE A LONG - NOTHING HERE
    let alphabet       = [];
    let states         = {};
    let startingState  = null;

    console.log(">>>>", fsmConstructor, fsmType)

    if (typeof fsmConstructor === "undefined")
        throw "Invalid FSM Selected!";

    // parse alphabet
    let alphabetString = alphabetInput.value.trim();

    if (alphabetString.indexOf(' ') >= 0)
        throw "Please do not have spaces in alphabet string input!";
    
    alphabet = alphabetString.split(',');

    // parse states
    let statesString = statesInput.value.trim();

    if (statesString.indexOf(' ') >= 0)
        throw "Please do not have spaces in states string input!";
    
    let statesArray = statesString.split(',');

    for (let stateSymbol of statesArray) {
        states[stateSymbol] = {
            transition : { },
            accepting : false,
        }
    }

    // starting state
    startingState = startingStateInput.value.trim();

    // accepting state
    states[acceptingStateInput.value.trim()].accepting = true;

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

    // Finally initialise fsm object    
    fsm = new fsmConstructor(
        alphabet,
        states,
        startingState
    );

    popup.style.display = "none";
}