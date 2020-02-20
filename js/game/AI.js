Node = function(bases, pieces){
    var competeTimes = 0;
    var curBases = bases;
    var curPieces = pieces;
};

var AI = {
    enable : false,
    difficulty : 0,
    playerNum : 2,

    // AI put real piece
    put: function(i, j){
        //move the piece to the selected base
        var base = QUARTO.board.getBase(i, j);
        GAME_STATES.SET_ON_BOARD = false;
        GAME_STATES.PICK_FOR_PLAYER = true;

        selectedMesh.putOnBoard(base, function() {
            if (selectedMesh != null) {
                selectedMesh.setSelected(false);
                selectedMesh = null;
                var winTest = QUARTO.board.isWin();
                if (winTest.finish) {
                    goFinish(winTest.bases, winTest.draw);
                } else {
                    // display next action
                    GUI.setCurrentAction(QUARTO.currentPlayer, GUI.PICK_ACTION);
                }
            }
        });
    },

    // AI 
    pick(mesh){
        // Unselect all pieces
        QUARTO.pieces.forEach(function(p) {
            p.setSelected(false);
        });
        // Set this mesh as selected
        mesh.setSelected(true, QUARTO.scene.getMaterialByID("sp"));
        // Keep in memory the selected one
        selectedMesh = mesh;
        // Switch player
        switchPlayer();
    },

    getAvailablePos: function(bases){
        var empty = []
        for(var i = 0; i < Gameboard.LINE; ++i){
            for(var j = 0; j < Gameboard.COL; ++j){
                if(!bases[i][j].piece){
                    empty.push([i,j]);
                }
            }
        }
        return empty;
    },

    getAvailablePiece: function(pieces){
        var available = [];
        pieces.forEach(p => {
            if(!p.isOnBoard && !p.isSelected){
                available.push(p);
            }
        });
        return available;
    },

    getAvailablePiece2: function(pieces){
        var available = [];
        pieces.forEach(p => {
            if(!p.isSelected){
                available.push(p);
            }
        });
        return available;
    },

    randomPut: function(bases){
        var empty = this.getAvailablePos(bases)
        var pos = empty[Math.floor(Math.random()*empty.length)];
        return pos;
    },

    randomPick: function(pieces){
        var available = this.getAvailablePiece(pieces);
        var mesh = available[Math.floor(Math.random()*available.length)];
        return mesh;
    },

    resetOnPointDown: function(){
        QUARTO.scene.onPointerDown = function (evt, pickResult) {
            if (GAME_STATES.GAME_STARTED) {
                if (pickResult.hit && !GAME_STATES.IS_FINISHED) {
                    var mesh = pickResult.pickedMesh;
                    // IF the player choose a piece for the other player
                    if (GAME_STATES.PICK_FOR_PLAYER && mesh instanceof Piece && !mesh.isOnBoard) {
                        // Unselect all pieces
                        QUARTO.pieces.forEach(function(p) {
                            p.setSelected(false);
                        });
                        // Set this mesh as selected
                        mesh.setSelected(true, QUARTO.scene.getMaterialByID("sp"));
                        // Keep in memory the selected one
                        selectedMesh = mesh;
                        // Switch player
                        switchPlayer();
                        // disable onPointerDown listener
                        if(QUARTO.model == "robot"){
                            QUARTO.scene.onPointerDown = null;
                        }
                    } else if (GAME_STATES.SET_ON_BOARD && mesh instanceof Base) {
                        // If the base does not contain a piece already
                        if (!mesh.piece) {

                            //move the piece to the selected base
                            var base = QUARTO.board.getBase(mesh.line, mesh.col);
                            GAME_STATES.SET_ON_BOARD = false;
                            GAME_STATES.PICK_FOR_PLAYER = true;
                            selectedMesh.putOnBoard(base, function() {
                                if (selectedMesh != null) {
                                    selectedMesh.setSelected(false);
                                    selectedMesh = null;
                                    var winTest = QUARTO.board.isWin();
                                    console.log(winTest);
                                    if (winTest.finish) {
                                        goFinish(winTest.bases, winTest.draw);
                                    } else {
                                        // display next action
                                        GUI.setCurrentAction(QUARTO.currentPlayer, GUI.PICK_ACTION);
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }
    },

    exNode: function(test_num){
        var real_pos = this.getAvailablePos(QUARTO.board.bases);
        var real_piece = this.getAvailablePiece(QUARTO.pieces);
        var pos_len = real_pos.length;
        var piece_len = real_piece.length;
        var maxValue = -10000;
        var maxPos = null;
        var maxPiece = null;
        for(var i = 0; i < pos_len; ++i){
            for(var j = 0; j < piece_len; ++j){
                var value = 0;
                for(var t = 0; t < test_num; ++t){
                    var v = new VirtualGame(1);
                    var virtual_pos = this.getAvailablePos(v.bases);
                    var virtual_piece = this.getAvailablePiece(v.pieces);
                    v.put(virtual_pos[i]);
                    v.pick(virtual_piece[j]);
                    var winTest = v.isWin();
                    if(winTest.finish){
                        console.log("finishCase");
                        return {pos: real_pos[i], piece: real_piece[j]};
                    }
                    
                    var res = v.runGame();
                    switch(res){
                        case 1:
                            value--;
                            break;
                        case 2:
                            value++;
                            break;
                        default:
                            break;
                    }
                }
                if(value > maxValue){
                    maxValue = value;
                    maxPos = i;
                    maxPiece = j;
                }
            }
        }
        console.log(value);
        return {pos: real_pos[maxPos], piece: real_piece[maxPiece]};
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

Object.defineProperty(QUARTO, 'currentPlayer', {
    get: function() {
        return currentPlayer;
    },
    set: async function(value){
        currentPlayer = value;
        if(currentPlayer == AI.playerNum && AI.enable){
            switch(AI.difficulty){
                case 0:
                    await sleep(500);
                    var pos = AI.randomPut(QUARTO.board.bases);
                    AI.put(pos[0], pos[1]);
                    await sleep(1000);
                    var mesh = AI.randomPick(QUARTO.pieces);
                    AI.pick(mesh);
                    AI.resetOnPointDown();
                    break;
                case 1:
                    await sleep(50);
                    var decision = AI.exNode(300);
                    AI.put(decision.pos[0], decision.pos[1]);
                    await sleep(1000);
                    AI.pick(decision.piece);
                    AI.resetOnPointDown();
                    console.log(selectedMesh.isSelected);
                    break;
                case 2:
                    await sleep(50);
                    var decision = AI.exNode(1500);
                    AI.put(decision.pos[0], decision.pos[1]);
                    await sleep(1000);
                    AI.pick(decision.piece);
                    AI.resetOnPointDown();
                    console.log(selectedMesh.isSelected);
                    break;
            }
        }
    }
})