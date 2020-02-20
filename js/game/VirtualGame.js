VirtualGame = function(curPlayer){
    // Copy board
    this.bases = [];
    for (var i = 0; i < Gameboard.LINE; ++i){
        this.bases.push([]);
        for (var j = 0; j < Gameboard.COL; ++j){
            this.bases[i].push(new simpleBase());
            var p = QUARTO.board.bases[i][j].piece;
            if(p){
                this.bases[i][j].piece = new simplePiece(p.isTall, p.isBlack, p.isCubic, p.isSolidTop);
                this.bases[i][j].piece.isOnBoard = true;
                this.bases[i][j].piece.isSelected = true;
            }
        }
    }

    // Copy pieces
    this.pieces = [];
    for(var i = 0; i < QUARTO.pieces.length; ++i){
        var p = QUARTO.pieces[i];
        this.pieces.push(new simplePiece(p.isTall, p.isBlack, p.isCubic, p.isSolidTop));
        if(p.isOnBoard || p.isSelected){
            this.pieces[i].isSelected = true;
            this.pieces[i].isOnBoard = p.isOnBoard;
        }
    }

    // Copy player and selectedMesh
    this.currentPlayer = curPlayer;
    for (var i = 0; i < QUARTO.pieces.length; ++i){
        var p = QUARTO.pieces[i];
        if (p.isTall == selectedMesh.isTall && p.isBlack == selectedMesh.isBlack && p.isCubic == selectedMesh.isCubic && p.isSolidTop == selectedMesh.isSolidTop){
            this.virtualSelectedMesh = p;
        }
    }

    // Get line
    this._getLine = function(line) {
        return this.bases[line];
    };

    this._getCol = function(col) {
        var array = [];
        for (var l=0; l<Gameboard.LINE; l++) {
            array.push(this.bases[l][col]);
        }
        return array;
    };

    this._isArrayWin = function(array) {
        var codeAnd = 15; // 1111
        var codeNotAnd = 15; // 1111
        array.forEach(function(base) {
            var piece = base.piece;
            if (piece) {
                var code = 0;
                if (piece.isSolidTop) {
                    code += 1;
                }
                if (piece.isCubic) {
                    code += 2;
                }
                if (piece.isBlack) {
                    code += 4;
                }
                if (piece.isTall) {
                    code += 8;
                }
                codeAnd &= code;
                codeNotAnd &= ~code;
            } else {
                codeAnd &= 0;
                codeNotAnd &= 0;
            }
        });
        return (codeAnd>0)?codeAnd:codeNotAnd;
    };

    this.isWin = function(){
        var code;
        var isFinish = false;
        var isDraw = false;

        // check lines
        for (var l=0; l<Gameboard.LINE; l++) {
            var line = this._getLine(l);
            code = this._isArrayWin(line);
            if (code > 0) {
                isFinish = true;
                break;
            }
        }
        // Check cols
        if (!isFinish) {
            for (var c=0; c<Gameboard.COL; c++) {
                var col = this._getCol(c);
                code = this._isArrayWin(col);
                if (code > 0) {
                    isFinish = true;
                    break;
                }
            }
        }

        // Check main diagonal
        if (!isFinish) {
            var diagonal = [];
            for(var i = 0; i < Gameboard.LINE; ++i){
                diagonal.push(this.bases[i][i]);
            }
            code = this._isArrayWin(diagonal);
            if (code > 0) {
                isFinish = true;
            }
        }

        // Check paradiagonal
        if (!isFinish) {
            var paradiagonal = [];
            for(var i = 0; i < Gameboard.LINE; ++i){
                paradiagonal.push(this.bases[Gameboard.LINE-1-i][i]);
            }
            code = this._isArrayWin(paradiagonal);
            if (code > 0) {
                isFinish = true;
            }
        }

        // Check draw
        if (!isFinish) {
            var full = true;
            for(var i = 0; i < Gameboard.LINE; ++i){
                for(var j = 0; j < Gameboard.COL; ++j){
                    if(!this.bases[i][j].piece){
                        full = false;
                        break;
                    }
                }
                if(full == false) break;
            }
            if(full == true){
                isFinish = true;
                isDraw = true
            }
        }

        return {finish:isFinish, draw:isDraw};
    }

    this.put = function(pos){
        this.bases[pos[0]][pos[1]].piece = this.virtualSelectedMesh;
        this.virtualSelectedMesh.isOnBoard = true;
        this.virtualSelectedMesh = null;
    }

    this.pick = function(mesh){
        mesh.isSelected = true;
        this.virtualSelectedMesh = mesh; 
    }

    this.runGame = function(){
        var res;
        while(true){
            this.put(AI.randomPut(this.bases));
            res = this.isWin();
            if(res.finish){
                break;
            }
            this.pick(AI.randomPick(this.pieces))
            this.currentPlayer = this.currentPlayer % 2 + 1;
        }
        if(!res.isDraw) return this.currentPlayer;
        else return 0;
    }
}

simpleBase = function(){
    this.piece = null;
}

simplePiece = function(isTall, isBlack, isCubic, isSolidTop){
    this.isTall = isTall;
    this.isBlack = isBlack;
    this.isCubic = isCubic;
    this.isSolidTop = isSolidTop;
    this.isSelected = false;
    this.isOnBoard = false;
}