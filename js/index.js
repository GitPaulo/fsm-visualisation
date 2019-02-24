let generateButton = document.getElementById("generate");
let acceptButton   = document.getElementById("accept");
let acceptInput    = document.getElementById("accept-input");

generateButton.onclick = function (params) {
    fsm = new DFA(
        ['a', 'b', 'c'],
        {
            '1' : {
                transition : {
                    'a' : '2',
                    'b' : '2'

                },
                accepting : false,
            },
            '2' : {
                transition : { 
                    'a' : '3',
                },
                accepting : false,
            },
            '3' : {
                transition : {
                    'c' : '4',
                },
                accepting : false,
            },
            '4' : {
                transition : {
                    'a' : '2',
                },
                accepting : true,
            },
        },
        '1'
    )
}

var acceptPromise;
acceptButton.onclick = function (params) {
    if ( fsm === null ) {
        alert("Must generate FSM first!");
        return;
    }   

    acceptPromise = fsm.accept(acceptInput.value).then((r) => (console.log(r) || true) && alert(`Accepted: ${r.accepted}\nMessage: ${r.message}`));
}
