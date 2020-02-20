var humanModel = function(){
    QUARTO.model = "human";
    GUI._removePage(GUI._get("indexWrapper"));
}

var robotModel = function(){
    QUARTO.model = "robot";
    GUI._removePage(GUI._get("indexWrapper"));
    GUI._removePage(GUI._get("loginWrapper"));
}

var setDifficulty = function(difficulty = 0){
    // Create players
    var name1 = "YOU";
    var name2 = "ROBOT";
    QUARTO.players = [
        new Player(name1, BABYLON.Color3.Green()),
        new Player(name2, BABYLON.Color3.Red())
    ];

    // Display loader
    GUI.displayLoader();

    // Display names
    GUI.displayNames(name1, name2);

    // Hide the login screen when the scene is ready
    QUARTO.scene.executeWhenReady(function() {
        GUI._removePage(GUI._get("levelChooseWrapper"))
        GUI.displayStartingTutorial();
    });

    AI.enable = true;
    AI.difficulty = difficulty;
}

var setSkyBox = function(){

}