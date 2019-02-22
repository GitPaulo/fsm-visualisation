let generateButton = document.getElementById("generate");
let playButton     = document.getElementById("play");
let pauseButton    = document.getElementById("pause");

generateButton.onclick = function (params) {
    fsm = new DFA(
        ['a', 'b', 'c'],
        {
            '1' : {
                transition : {
                    'a' : '2',
                    'b' : '4'

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
                    'c' : '4'
                },
                accepting : false,
            },
            '4' : {
                transition : {
                    'a' : '2'
                },
                accepting : true,
            },
        },
        '1'
    )
}

playButton.onclick = function (params) {
    
}

pauseButton.onclick = function (params) {
    
}
