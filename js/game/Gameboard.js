/**
 * The quarto gameboard
 * @param size
 * @param scene
 * @constructor
 */
Gameboard = function(size, scene) {
    BABYLON.Mesh.call(this, "ground", scene);

    this.position = BABYLON.Vector3.Zero();

    this.bases = [];

    var space = 1;
    var baseSize = size / 4;
    var baseRadius = baseSize /2;


    // Children
    for (var l=0; l<Gameboard.LINE; l++) {
        // create a cylinder
        var col = [];
        for (var c=0; c<Gameboard.COL; c++) {

            var position = new BABYLON.Vector3(c*baseSize-size/2+baseRadius, 0, l*baseSize+(size/2)*(1-l)-baseRadius);
            var b = new Base("base"+l+"-"+c, baseSize-space, position, scene, l, c);
            b.parent = this;

            col.push(b);
        }
        this.bases.push(col);
    }

    var objSize = 1.5*size;
    var obj = BABYLON.Mesh.CreateBox("obj", objSize, scene);
    obj.rotation.y = Math.PI/4;
    obj.scaling.y = 0.04;
    obj.position.y = -objSize*0.04/2;
    obj.parent = this;

    var objMat = new BABYLON.StandardMaterial("objmat", scene);
    objMat.diffuseTexture = new BABYLON.Texture("img/board_1024.jpg", scene);
    objMat.specularColor = BABYLON.Color3.Black();
    obj.material = objMat;

    // Create a material for selected pieces
    var sp = new BABYLON.StandardMaterial("sp", scene);
    sp.diffuseColor = BABYLON.Color3.FromInts(241, 216, 39);
    this.selectedPieceMaterial = sp;
};

Gameboard.LINE=4;
Gameboard.COL=4;

Gameboard.prototype = Object.create(BABYLON.Mesh.prototype);
Gameboard.prototype.constructor = Gameboard;


Gameboard.prototype.getBasePosition = function(i, j) {
    return this.bases[i][j].getAbsolutePosition();
};

Gameboard.prototype.getBase = function(i, j) {
    return this.bases[i][j];
};

Gameboard.prototype._getLine = function(line) {
    return this.bases[line];
};

Gameboard.prototype._getCol = function(col) {
    var array = [];
    for (var l=0; l<Gameboard.LINE; l++) {
        array.push(this.bases[l][col]);
    }
    return array;
};

Gameboard.prototype.isWin = function() {
    var code;
    var isFinish = false;
    var isDraw = false;
    var arrayWinner;

    // check lines
    for (var l=0; l<Gameboard.LINE; l++) {
        var line = this._getLine(l);
        code = this._isArrayWin(line);
        if (code > 0) {
            isFinish = true;
            arrayWinner = line;
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
                arrayWinner = col;
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
            arrayWinner = diagonal;
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
            arrayWinner = paradiagonal;
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

    return {finish:isFinish, draw:isDraw, bases:arrayWinner};
};

Gameboard.prototype._isArrayWin = function(array) {
    var codeAnd = 15; // 1111
    var codeNotAnd = 15; // 1111
    array.forEach(function(base) {
        var piece = base.piece;
        if (piece) {
            codeAnd &= piece.getCode();
            codeNotAnd &= ~piece.getCode();
        } else {
            codeAnd &= 0;
            codeNotAnd &= 0;
        }
    });

    return (codeAnd>0)?codeAnd:codeNotAnd;
};

/**
 * Reset the gameboard
 */
Gameboard.prototype.reset = function() {
    this.bases.forEach(function(array) {
        array.forEach(function(b) {
            b.reset();
        });
    });
};