/**
 * Class that holds information about the end state of the acceptance algorithm for the FSMs
 */
class AcceptanceResult {
    constructor(input, accepted, message) {
        this.accepted = accepted;
        this.input    = input;
        this.message  = message;
    }
}

/**
 * Parent class of the FSMs
 */
class FiniteStateMachine {
    constructor(alphabet, states, starting) {
        // Verify Validity of Arguments
        if (alphabet.length <= 0)
            throw "Alphabet cannot be of length < 0!";

        // Verify states object
        this.states = states;

        Object.defineProperty(this, "numberOfStates", {
            get() {
                let size = 0;
                for (let symbol in this.states)
                    if (this.states.hasOwnProperty(symbol))
                        size++;
                return size;
            }
        })

        if (this.numberOfStates <= 0)
            throw "There must be at least one state in the FSM!";

        if (typeof starting == "undefined")
            throw "There must be a defined starting state!";

        if (typeof this.states[starting] == "undefined")
            throw "Starting state is undefined! Please add it to the states object!";

        this.starting = this.getState(starting);

        // Setup quick look-up of state symbol
        for (let symbol in this.states)
            if (this.states.hasOwnProperty(symbol))
                this.states[symbol].symbol = symbol;

        // Setup quick look-up of alphabet
        this.alphabet = {};
        for (let symbol of alphabet)
            this.alphabet[symbol] = symbol;
    }

    getState(symbol) {
        return this.states[symbol];
    }

    getStatesSymbolArray() {
        return Object.keys(this.states);
    }

    getSymbolFromState(state) {
        return state.symbol;
    }

    getTransitionState(state, symbol) {
        let nextSymbol = state.transition[symbol];
        return typeof nextSymbol === "undefined" ? false : this.getState(nextSymbol);
    }

    isValidSymbol(symbol) {
        return symbol in this.alphabet;
    }

    isStartingState(state) {
        return state === this.starting;
    }

    isAcceptingState(state) {
        return state.accepting;
    }

    hasGUIElementInitialised() {
        return !(typeof this.GUIElement === "undefined");
    }

    getStateGUIElementBySymbol(symbol) {
        return this.GUIElement.states[symbol];
    }

    getTransistionGUIElement(stateSymbolFrom, stateSymbolTo) {
        return this.GUIElement.transitions[stateSymbolFrom + "," + stateSymbolTo];
    }

    accept() {
        throw "This method is not implemented";
    }

    setup(env) {
        if (!this.hasGUIElementInitialised()) {
            this.GUIElement = {
                states:      {},
                transitions: {},
            }

            Object.defineProperty(this.GUIElement, 'env', {
                value: env,
                enumerable: false,
                configurable: true,
                writable: false,
            });

            // State Elements first >>>> CHANGE RANDOM POSITIONING HERE <<<
            let i = 0;
            for (let stateSymbol in this.states) {
                let state      = this.getState(stateSymbol);
                let offset     = 150; // change this lol
                let isStarting = this.isStartingState(state);
                let stateGUI   = new StateElementGUI(state.symbol, state.accepting, isStarting, {
                    x: env.random(offset, env.width - offset),
                    y: env.random(offset, env.height - offset),
                    radius: 100,
                    index : i
                }, env);

                this.GUIElement.states[stateSymbol] = stateGUI;
                i++;
            }

            // Now Transition Elements - (dependant)
             // Format this.GUIElement.transitions = { "1,2" : { "a" : [el1, el2], "b" : [el3], (...) } }
            for (let stateSymbol in this.states) {
                let state = this.getState(stateSymbol);
                for (let transitionSymbol in state.transition) {
                    let transitionStateSymbolArray = state.transition[transitionSymbol].constructor === Array 
                                                        ? state.transition[transitionSymbol] : [state.transition[transitionSymbol]];
                    for (let transitionStateSymbol of transitionStateSymbolArray) {
                        let edgeSymbol = `${stateSymbol},${transitionStateSymbol}`;
                        let edgeObject = this.GUIElement.transitions[edgeSymbol];

                        if ( typeof edgeObject === "undefined") {
                            let fromState   = this.GUIElement.states[stateSymbol];
                            let toState     = this.GUIElement.states[transitionStateSymbol];
                            let direction   = fromState.index > toState.index ? TransistionElementGUI.FORWARD : TransistionElementGUI.BACKWARD;

                            // Call me Mr. Hacky Boy - pls never show this to anyone - k thx bye
                            let offsetSymbol = swapSubstrings(edgeSymbol, stateSymbol, transitionStateSymbol);
                            let needsOffset  = typeof this.GUIElement.transitions[offsetSymbol] === "undefined" ? false : true;

                            if (needsOffset)
                                this.GUIElement.transitions[offsetSymbol].needsOffset = true;

                            this.GUIElement.transitions[edgeSymbol] = new TransistionElementGUI(transitionSymbol, fromState, toState, direction, needsOffset, env);
                        } else {
                            let newTransistionSymbol = edgeObject.symbol + "," + transitionSymbol;
                            this.GUIElement.transitions[edgeSymbol].symbol = newTransistionSymbol;
                        }
                    } 
                }
            }
        }
        return this;
    }

    draw() {
        let env                = this.GUIElement.env;
        let stateElements      = this.GUIElement.states;
        let transitionElements = this.GUIElement.transitions;

        // console.log(transitionElements);
        // draw transitions (so that they go in the back of state elements)
        for (let edgeSymbol in transitionElements) {
            let edgeObject = transitionElements[edgeSymbol];
            edgeObject.draw(env);
        }
        
        // draw states
        for (let stateSymbol in stateElements) {
            let stateElement = stateElements[stateSymbol];
            stateElement.draw(env);
        }
    }
}

/*
 * DFA extending parent class  
 * Currently I do not represent dead states. Leave it like that? Matters on NFA --> DFA conversion too!
 */
const SLEEP_TIME = 700;
class DFA extends FiniteStateMachine {
    constructor(alphabet, states, starting) {
        super(alphabet, states, starting);
    }

    async accept(string) {
        let state = this.starting;

        // highlight starting state
        if (this.hasGUIElementInitialised()) {
            let stateElement = this.getStateGUIElementBySymbol(state.symbol);
            stateElement.highlight([255, 100, 100]);
            await sleep(SLEEP_TIME);
            stateElement.highlight([200, 200, 200]);
        }
        
        for (let i = 0; i < string.length; i++) {
            let symbol = string.charAt(i);
            // Check if symbol is in alphabet
            if (!this.isValidSymbol(symbol))
                return new AcceptanceResult(string, false, "An invalid symbol was found in the input! (not belong in alpahabet)");

            // Check if there is a valid transition
            let transitionState = this.getTransitionState(state, symbol);
            if (!transitionState)
                return new AcceptanceResult(string, false, "DFA reached a dead state!")

            // highlight (transition) next state
            if (this.hasGUIElementInitialised()) {
                let transitionStateElement = this.getStateGUIElementBySymbol(transitionState.symbol);
                let transitionGUIElement   = this.getTransistionGUIElement(state.symbol, transitionState.symbol) // ITS A DFA SO ONLY 1 EVER - NOT THE CASE FOR NFA!!!!Q

                let prevColorS = transitionStateElement.color;
                let prevColorT = transitionGUIElement.color;
                
                // Highlight Transition
                transitionGUIElement.highlight([255, 100, 100]);
                await sleep(SLEEP_TIME);
                transitionGUIElement.highlight(prevColorT);

                // Highlight Next Node
                transitionStateElement.highlight([255, 100, 100]);
                await sleep(SLEEP_TIME);
                transitionStateElement.highlight(prevColorS);  
            }

            state = transitionState;
        }

        return new AcceptanceResult(string, this.isAcceptingState(state), "DFA has processed the input correctly!");
    }
}

/**
 * NFA extending parent class.
 */
class NFA extends FiniteStateMachine {
    constructor(alphabet, states, starting) {
        super(alphabet, states, starting);
    }

    // problem if starting state is accept state - debug!
    /**
     * Not working properly
     * Test case: ababc
     * new NFA(["a","b","c"],{1:{transition:{a:["2","3"],b:"2"},accepting:!1},2:{transition:{a:"3",b:["1","3"],c:["4","3"]},accepting:!1},3:{transition:{c:"4"},accepting:!1},4:{transition:{a:"2"},accepting:!0}},"1");
     */
    async accept(string) {
        let S = this.getStatesSymbolArray();
        let C = [];

        let n = string.length;
        let startingStateSymbol = this.starting.stateSymbol;

        // If starting state is not first they swap to be first
        if (S[0] !== startingStateSymbol) {
            for (let i = 0; i < S.length; i++) {
                if (S[i] === startingStateSymbol) { 
                    [S[0], S[i]] = [S[i], S[0]];
                }
            }
        }

        for (let i = 1; i <= n; i++) {
            let inputSymbol = string.charAt(i - 1);

            if (!this.isValidSymbol(inputSymbol))
                return new AcceptanceResult(string, false, "An invalid symbol was found in the input! (not belong in alpahabet)");

            S[i - 1] = S[i - 1] || [];
            C[i]     = C[i]     || [];

            for (let stateSymbol of S[i - 1]) {
                let currentState              = this.getState(stateSymbol);
                let reachableStatesWithSymbol = currentState.transition[inputSymbol];

                if (typeof reachableStatesWithSymbol === "undefined")
                    continue;

                C[i] = [...new Set([...C[i], ...reachableStatesWithSymbol])]; // concatonate two arrays -> make a set -> make array of set
            }
        }

        console.log(C, S);

        for (let stateSymbol of C[n]) {
            let state = this.getState(stateSymbol);
            if (state.accepting)
                return new AcceptanceResult(string, true, "NFA has accepted the input! (There exists one possible accepting result)");
        }

        return new AcceptanceResult(string, false, "NFA has rejected input!")
    }

    convertToDFA() {

    }
}

/**
 * TO DO!
 */
class E_NFA extends FiniteStateMachine { // extend NFA?
    constructor(alphabet, states, starting) {
        super(alphabet, states, starting);
    }

    accept(string) {

    }
}

window.DFA   = DFA;
window.NFA   = NFA;
window.E_NFA = E_NFA;