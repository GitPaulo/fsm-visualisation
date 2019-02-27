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
let transitionTable     = document.getElementById("transition-table");

/***************
 * Page Logic
***************/
acceptInput.value = "< Type Input String Here >";

generateButton.onclick = function (params) {
    popup.style.display    = "block";
    acceptButton.className = "hvr-underline-from-center pure-button button-accept";
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

span.onclick = function () {
    popup.style.display    = "none";
    acceptButton.className = "hvr-underline-from-center pure-button button-accept pure-button-disabled";
}

alphabetInput.onblur = function () {
    
}

statesInput.onblur = function () {

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

    // Finally initialise fsm object    
    fsm = new fsmConstructor(
        alphabet,
        states,
        startingState
    );

    popup.style.display = "none";
}