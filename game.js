/*
 Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
 Perlenspiel is Copyright © 2009-17 Worcester Polytechnic Institute.
 This file is part of Perlenspiel.

 Perlenspiel is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published
 by the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Perlenspiel is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU Lesser General Public License for more details.

 You may have received a copy of the GNU Lesser General Public License
 along with Perlenspiel. If not, see <http://www.gnu.org/licenses/>.
 */

// game.js for Perlenspiel 3.2.x
// This is a template for creating new Perlenspiel games

// The following comment lines are for JSLint/JSHint. Don't remove them!

// The "use strict" directive in the following line is important. Don't remove it!
"use strict";
/*jslint nomen: true, white: true */
/*global PS */


var G = (function () {
    var constants = {
        WIDTH: 20,
        HEIGHT: 20,
        BG_COLOR: PS.COLOR_BLACK,
        RIGHT_COLOR: PS.COLOR_YELLOW,
        WRONG_COLOR: 255*65536+100*256+100,
        PLAYAREA_COL: {r: 25, g: 25, b: 25},

        ALL_LETTERS: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    };

    var originalQuote;
    var difficulty;
    var screen;
    var hintTimer;
    var currentLevel = 0;
    var lm = new LetterMap();
    var selectedBead = {
        x: null,
        y: null
    };
    //2 parts to every quote: quote and revealed letters
    var levelQuotes = [
        ["I know. I was there. I saw the great void in your soul, and you saw mine.","KOWASVOULDTHEG", "1: Single-Letter Words are Nice"],
        ["I look at you and a sense of wonder takes me.", "SDYOFUELW", "2: More Single-Letter Words"],
        ["I took a deep breath and listened to the old brag of my heart; I am, I am, I am.", "TEIBHLGD", "3: Small Words are Your Friends"],
        ["It was the best of times, it was the worst of times.", "BEFEWORS", "4: Some Words Repeat"],
        ["To be, or not to be: that is the question", "THAQUN", "5: Small Word Repetition"],
        ["Everything was terrifyingly complex; everything was terrifyingly simple.", "ING", "6: The Key to EverythING"],
        ["I don't know what's worse: to not know what you are and be happy, or to become what you've always wanted to be, and feel alone.", "S", "7: What Comes After Apostrophes?"],
        ["It is a far, far better thing that I do than I have ever done before; it is a far, far better rest that I go to, than I have ever known.","","8: A Review, in Short"],
        ["I cannot but conclude that the Bulk of your Natives, to be the most pernicious Race of little odious Vermin that Nature ever suffered to crawl upon the Surface of the Earth.","NF","9: Double Double"],
        ["As Gregor Samsa awoke one morning from uneasy dreams he found himself transformed in his bed into a gigantic insect","GS","10: The Name Game"],
        ["THERE IS NO GREATER AGONY THAN BEARING AN UNTOLD STORY INSIDE YOU.","","11: The Final 5: Part One"],
        ["He's more myself than I am. Whatever our souls are made of, his and mine are the same","","12: The Final 5: Part Two"],
        ["A woman, especially, if she have the misfortune of knowing anything, should conceal it as well as she can.","","13: The Final 5: Part Three"],
        ["If an injury has to be done to a man it should be so severe that his vengeance need not be feared","","14: The Final 5: Part Four"],
        ["He who fights with monsters might take care lest he thereby become a monster. And if you gaze for long into an abyss, the abyss gazes also into you.","","15: The Final 5: Part Five"]];

    var quotes = {list:(function() {
        return ["I have lived to see strange days.",
                "He said something about punctuality being one of the minor virtues which we do not acquire until later in life.",
                "Nothing contributes so much to tranquillize the mind as a steady purpose.",
                "Honest people don't hide their deeds.",
                "I like large parties. They're so intimate. At small parties there isn't any privacy.",
                "So we drove on toward death through the cooling twilight. ",
                "We may brave human laws, but we cannot resist natural ones.",
                "Madness in great ones must not unwatch'd go",
                "Treachery and violence are spears pointed at both ends; they wound those who resort to them worse than their enemies",
                "Why, sometimes I've believed as many as six impossible things before breakfast",
                "All animals are equal, but some animals are more equal than others.",
                "Puns are the highest form of literature",
                "Music expresses that which cannot be put into words and that which cannot remain silent",
                "The person, be it gentleman or lady, who has not pleasure in a good novel, must be intolerably stupid",
                "Outside of a dog, a book is man's best friend. Inside of a dog it's too dark to read"];
    })(),
    random:function () {
        return this.list[Math.floor(Math.random() * this.list.length)];
    }};

    function LetterMap() {
        var outputMap = {mapping:{}, encode:function (str){}};

        function shuffledLetters() {
            var output = constants.ALL_LETTERS.slice();
            for (var i = output.length - 1; i >= 0; i--) {
                var randIndex = Math.floor(Math.random()*i);
                var temp = output[i];
                output[i] = output[randIndex];
                output[randIndex] = temp;
            }
            return output;
        }
        var shuffle = shuffledLetters();

        for(var i = 0; i < shuffle.length; i++){
            outputMap.mapping[constants.ALL_LETTERS[i]] = shuffle[i];
        }

        outputMap.encode = function (str) {
            var charArr = str.split("");
            return charArr.map(
                function (c) {
                    if(outputMap.mapping[c]){
                        return outputMap.mapping[c];
                    }
                    return c;
                }
            )
        };

        return outputMap;
    }

    return {
        constants: constants,
        levelQuotes:levelQuotes,
        hintTimer: hintTimer,
        quotes:quotes,
        lm:lm,
        currentLevel:currentLevel,
        selectedBead:selectedBead,
        LetterMap: LetterMap
    };
}());

//initializes the starting menu for the project
function initStartMenu() {
    resetGrid();
    G.screen = "start";

    var start = "START GAME";
    for(var i = 0; i < start.length; i++){
        if(start[i] !== " ") {
            PS.glyph(5 + i, 4, start[i]);
            PS.glyph(5 + i, 5, G.lm.encode(start[i])[0]);
            PS.glyphColor(5 + i, 5, PS.COLOR_BLACK);
            PS.color(5 + i, 5, PS.COLOR_YELLOW);
            PS.border(5 + i, 5, 2);
        }
    }

    //select the difficulty and then immediately go to the quote
    var diff = "DIFFICULTY";
    for(var i = 0; i < diff.length; i++){
        PS.glyph(5+i, 9, diff[i]);
    }

    PS.glyph(5, 11, "1");
    PS.glyph(9, 11, "2");
    PS.glyph(13, 11, "3");

}

function levelSelectScreen(){
    resetGrid();
    G.screen = "levelselect";
    PS.statusText("Select a Level");
    var colOffset = 3;
    var rowOffset = 3;
    for(var level = 1; level <= 15; level++){
        //print the 2 characters of every number
        PS.glyph(colOffset, rowOffset, (level/10)%10+"");
        PS.glyph(colOffset+1, rowOffset, level%10+"");
        //data field is used to determine how it will look when hovered over
        PS.data(colOffset, rowOffset, ["left", level]);
        PS.data(colOffset+1, rowOffset, ["right", level]);

        PS.borderColor(colOffset, rowOffset, PS.COLOR_YELLOW);
        PS.borderColor(colOffset+1, rowOffset, PS.COLOR_YELLOW);

        colOffset += 3;

        if(colOffset === 18) {
            colOffset = 3;
            rowOffset += 3;
        }
    }
    var inf = "INFINITE";
    for(var i = 0; i < inf.length; i++){
        PS.borderColor(6+i, 13, PS.COLOR_YELLOW);
        PS.glyph(6+i, 13, inf[i]);
    }
}

//initializes the cypher to be solved
//letters above will be the cyphered text
//black spaces below will contain the correct letter in their data field
function initCypher(){
    G.lm = new G.LetterMap();
    resetGrid();
    G.screen = "play";
    G.hintTimer = window.setTimeout(hint, 3000);
    if(G.currentLevel !== "infinite") {
        PS.statusText(G.levelQuotes[G.currentLevel][2]);
    }
    else{
        PS.statusText("Infinite Mode");
    }
    //create the cyphered string from the originalQuote
    var cyphered = G.lm.encode(G.originalQuote).join("");

    //split the strings into their individual words
    var originalWords = G.originalQuote.split(" ");
    cyphered = cyphered.split(" ");

    var colOffset = 0;
    var rowOffset = 2;
    //go through every word in the string
    for(var i = 0; i < originalWords.length; i++){
        //move word to next line if it won't fit on current line
        if(colOffset + originalWords[i].length > G.constants.WIDTH){
            colOffset = 0;
            rowOffset += 2;
        }

        //go through every letter in each word
        for(var j = 0; j < originalWords[i].length; j++){
            //print every letter in the cyphered word
            PS.glyph(colOffset, rowOffset, cyphered[i][j]);

            //make the beads below them white, with the real letter in the data of the bead, only if letters
            if(originalWords[i][j] >= "A" && originalWords <= "Z") {
                PS.color(colOffset, rowOffset + 1, PS.COLOR_WHITE);
                PS.glyphColor(colOffset, rowOffset + 1, PS.COLOR_BLACK);
                PS.border(colOffset, rowOffset + 1, 2);
                PS.data(colOffset, rowOffset + 1, originalWords[i][j]);
            }
            else{
                PS.glyph(colOffset, rowOffset+1, cyphered[i][j]);
            }

            //increase the offset
            colOffset++;
        }

        //add the space after words
        colOffset++;
        if(colOffset > G.constants.WIDTH-1){
            colOffset = 0;
            rowOffset += 2;
        }
    }

    var revealed = "";
    if(G.currentLevel < 15){
        revealed = G.levelQuotes[G.currentLevel][1];
    }
    for(var i = 0; i < revealed.length; i++){
        updateCypher(revealed[i]);
    }

    //put the back button
    var back = "BACK";
    for(var i = 0; i < back.length; i++){
        PS.glyph(i, 0, back[i]);
        PS.borderColor(i, 0, PS.COLOR_YELLOW);
    }
}

//update cypher with the new input data
function updateCypher(letter){
    //place the new letter in the new spot
    clearTimeout(G.hintTimer);
    G.hintTimer = setTimeout(hint, 3000);
    if(G.selectedBead.x !== null) {
        PS.glyph(G.selectedBead.x, G.selectedBead.y, letter);
    }
    var originalWords = G.originalQuote.split(" ");
    var cypherLetter;

    if(G.selectedBead.x !== null) {
        cypherLetter = PS.glyph(G.selectedBead.x, G.selectedBead.y - 1);
    }
    else{
        cypherLetter = G.lm.encode(letter)[0];
    }

    //go through the entire cypher
    var colOffset = 0;
    var rowOffset = 3;
    for(var i = 0; i < originalWords.length; i++){
        //move word to next line if it won't fit on current line

        if(colOffset + originalWords[i].length > G.constants.WIDTH){
            colOffset = 0;
            rowOffset += 2;
        }

        for(var j = 0; j < originalWords[i].length; j++){
            //PS.glyph(colOffset, rowOffset, PS.data(colOffset, rowOffset));
            if(PS.glyph(colOffset, rowOffset-1) === cypherLetter ||
                String.fromCharCode(PS.glyph(colOffset, rowOffset-1)) === cypherLetter){
                //if this is from the difficulty level
                PS.glyph(colOffset, rowOffset, letter);


                if(G.selectedBead.x === null){
                    PS.color(colOffset, rowOffset, PS.COLOR_YELLOW);
                }
                else {
                    PS.fade(colOffset, rowOffset, 60, {rgb: PS.COLOR_BLUE});
                    PS.color(colOffset, rowOffset, PS.COLOR_WHITE);
                }
            }

            //increase the offset
            colOffset++;
        }

        //add the space after words
        colOffset++;
        if(colOffset > G.constants.WIDTH-1){
            colOffset = 0;
            rowOffset += 2;
        }

    }
    //deselect the bead after the operation is done
    if(G.selectedBead.x !== null) {
        selectBead(G.selectedBead.x, G.selectedBead.y);
    }

    checkCompletion();
}

//removes the letter in the selected space from the rest of the cypher
function removeCypherLetter(){

    var originalWords = G.originalQuote.split(" ");
    var letter = PS.glyph(G.selectedBead.x, G.selectedBead.y-1);

    //go through the entire cypher
    var colOffset = 0;
    var rowOffset = 3;
    for(var i = 0; i < originalWords.length; i++){

        //move word to next line if it won't fit on current line
        if(colOffset + originalWords[i].length > G.constants.WIDTH){
            colOffset = 0;
            rowOffset += 2;
        }

        for(var j = 0; j < originalWords[i].length; j++){
            if(PS.glyph(colOffset, rowOffset-1) === letter){
                PS.color(colOffset, rowOffset, PS.COLOR_WHITE);
                PS.glyph(colOffset, rowOffset, 0);
            }

            //increase the offset
            colOffset++;
        }

        //add the space after words
        colOffset++;
        if(colOffset > G.constants.WIDTH-1){
            colOffset = 0;
            rowOffset += 2;
        }

    }
    //deselect the bead after the operation is done
    selectBead(G.selectedBead.x, G.selectedBead.y);
}

//checks if the input values are correct
function checkCorrectness(){
    //place the new letter in the new spot
    var originalWords = G.originalQuote.split(" ");

    //go through the entire cypher
    var colOffset = 0;
    var rowOffset = 3;
    for(var i = 0; i < originalWords.length; i++){

        //move word to next line if it won't fit on current line
        if(colOffset + originalWords[i].length > G.constants.WIDTH){
            colOffset = 0;
            rowOffset += 2;
        }

        for(var j = 0; j < originalWords[i].length; j++){
            PS.fade(colOffset, rowOffset, 0);

            if(PS.color(colOffset, rowOffset) === PS.COLOR_WHITE && PS.glyph(colOffset, rowOffset) !== 0){
                //if it's incorrect, mark it as such
                if(String.fromCharCode(PS.glyph(colOffset, rowOffset)) !== PS.data(colOffset, rowOffset)){
                    PS.color(colOffset, rowOffset, G.constants.WRONG_COLOR);
                }else{
                    PS.color(colOffset, rowOffset, G.constants.RIGHT_COLOR)
                }
            }

            //increase the offset
            colOffset++;
        }

        //add the space after words
        colOffset++;
        if(colOffset > G.constants.WIDTH-1){
            colOffset = 0;
            rowOffset += 2;
        }

    }
    //deselect the bead after the operation is done
    selectBead(G.selectedBead.x, G.selectedBead.y);
}

//function to check to see if the cypher is completely solved
function checkCompletion(){
    var correct = true;
    var originalWords = G.originalQuote.split(" ");

    //go through the entire cypher
    var colOffset = 0;
    var rowOffset = 3;
    for(var i = 0; i < originalWords.length; i++){
        //move word to next line if it won't fit on current line
        if(colOffset + originalWords[i].length > G.constants.WIDTH){
            colOffset = 0;
            rowOffset += 2;
        }

        for(var j = 0; j < originalWords[i].length; j++){
            if(PS.color(colOffset, rowOffset) === PS.COLOR_WHITE){
                //if it's incorrect, mark it as such
                if(String.fromCharCode(PS.glyph(colOffset, rowOffset)) !== PS.data(colOffset, rowOffset)){
                    correct = false;
                }
            }

            //increase the offset
            colOffset++;
        }

        //add the space after words
        colOffset++;
        if(colOffset > G.constants.WIDTH-1){
            colOffset = 0;
            rowOffset += 2;
        }

    }

    if(correct){
        congratulate();
        checkCorrectness();
        clearTimeout(G.hintTimer);
    }
}

function congratulate(){
    G.screen = "congrats";
    PS.statusText("Congratulations!");
    var next = "NEXT";
    for(var i = 0; i < next.length; i++){
        PS.glyph(16+i, 0, next[i]);
        PS.borderColor(16+i, 0, PS.COLOR_YELLOW);
    }
}

//prompts the player if they need a hint, usually starts after
function hint(){
    var hint = "HINT?";
    for(var i = 0; i < hint.length; i++){
        PS.glyph(i, G.constants.HEIGHT-1, hint[i]);
        PS.borderColor(i, G.constants.HEIGHT-1, PS.COLOR_YELLOW);
    }
}

function revealLetter(){
    var originalWords = G.originalQuote.split(" ");

    //go through the entire cypher
    var colOffset = 0;
    var rowOffset = 3;
    for(var i = 0; i < originalWords.length; i++){
        //move word to next line if it won't fit on current line
        if(colOffset + originalWords[i].length > G.constants.WIDTH){
            colOffset = 0;
            rowOffset += 2;
        }

        for(var j = 0; j < originalWords[i].length; j++){
            if(PS.color(colOffset, rowOffset) === PS.COLOR_WHITE){
                //if it's incorrect, mark it as such
                if(String.fromCharCode(PS.glyph(colOffset, rowOffset)) !== PS.data(colOffset, rowOffset)){
                    updateCypher(PS.data(colOffset, rowOffset));
                    return;
                }
            }

            //increase the offset
            colOffset++;
        }

        //add the space after words
        colOffset++;
        if(colOffset > G.constants.WIDTH-1){
            colOffset = 0;
            rowOffset += 2;
        }

    }
}


//function to select an empty bead
function selectBead(x, y){

    //deselect the previous selected bead
    if(G.selectedBead.x !== null && G.selectedBead.y !== null) {
        PS.border(G.selectedBead.x, G.selectedBead.y, 2);
        PS.borderColor(G.selectedBead.x, G.selectedBead.y, PS.COLOR_BLACK);
    }
    //select the new bead if its not the same one
    if(G.selectedBead.x !== x || G.selectedBead.y !== y) {
        PS.border(x, y, 4);
        PS.borderColor(x, y, PS.COLOR_RED);
        G.selectedBead.x = x;
        G.selectedBead.y = y;
    }
    else{
        G.selectedBead.x = null;
        G.selectedBead.y = null;
    }
}

function resetGrid(){
    PS.color(PS.ALL, PS.ALL, G.constants.PLAYAREA_COL);
    PS.border(PS.ALL, PS.ALL, 0);
    PS.borderColor(PS.ALL, PS.ALL, PS.COLOR_BLACK);
    PS.glyph(PS.ALL, PS.ALL, 0);
    PS.glyphColor(PS.ALL, PS.ALL, PS.COLOR_WHITE);
    PS.fade(PS.ALL, PS.ALL, 0);
    PS.data(PS.ALL, PS.ALL, 0);
}

// All of the functions below MUST exist, or the engine will complain!

// PS.init( system, options )
// Initializes the game
// This function should normally begin with a call to PS.gridSize( x, y )
// where x and y are the desired initial dimensions of the grid
// [system] = an object containing engine and platform information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

// Add any other initialization code you need here
// Use PS.gridSize( x, y ) to set the grid to
// Otherwise you will get the default 8x8 grid
// the initial dimensions you want (32 x 32 maximum)
// Do this FIRST to avoid problems!





PS.init = function (system, options) {
    //setup the grid
    PS.gridSize(G.constants.WIDTH, G.constants.HEIGHT);
    PS.gridColor(G.constants.BG_COLOR);
    //initialize the cyphered text, all uppercase letters just in case also
    G.originalQuote = G.quotes.list[G.currentLevel].toUpperCase();
    PS.statusColor(PS.COLOR_WHITE);
    //initCypher();
    levelSelectScreen();
};


// PS.touch ( x, y, data, options )
// Called when the mouse button is clicked on a bead, or when a bead is touched
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details


PS.touch = function (x, y, data, options) {
    // Uncomment the following line to inspect parameters
    //PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );


    // Add code here for mouse clicks/touches over a bead
    //if this is one of the empty beads
    if(G.screen === "levelselect"){
        if(PS.glyph(x, y) !== 0) {
            if (PS.data(x, y) !== 0) {
                G.currentLevel = PS.data(x, y)[1] - 1;
                G.originalQuote = G.levelQuotes[G.currentLevel][0].toUpperCase();
                initCypher();
            }
            else{
                G.currentLevel = "infinite";
                G.originalQuote = G.quotes.random().toUpperCase();
                initCypher();
            }
        }

    }
    else if(G.screen === "start"){
        if(PS.glyph(x, y) >= 49 && PS.glyph(x, y) <= 51){
            G.difficulty = PS.glyph(x, y) - 48;
            levelSelectScreen();

        }
    }
    else if(G.screen === "play"){
        //back button
        if(x < 4 && y === 0){
            levelSelectScreen();
        }
        //select bead
        else if (PS.color(x, y) === PS.COLOR_WHITE || PS.color(x, y) === G.constants.WRONG_COLOR) {
            selectBead(x, y);
        }
        //else deselect the bead if there is one selected and clicking on an non input bead
        else if (G.selectedBead.x !== null && G.selectedBead.y !== null) {
            selectBead(G.selectedBead.x, G.selectedBead.y);
        }
        //check button
        else if (x >= 15 && y === G.constants.HEIGHT-1 && PS.glyph(x,y) !== 0) {
            checkCorrectness();
        }
        else if(x === 0 && y === G.constants.HEIGHT-1){
            revealLetter();
        }
    }
    else if(G.screen === "congrats"){
        //back button
        if(x < 4 && y === 0){
            levelSelectScreen();
        }
        //next level button
        else if(x >= 16 && y == 0){
            //normal level mode
            if(G.currentLevel !== "infinite") {
                G.currentLevel++;
                G.originalQuote = G.levelQuotes[G.currentLevel][0].toUpperCase();
            }
            else{
                G.originalQuote = G.quotes.random().toUpperCase();
            }
            initCypher();
        }

    }


};


// PS.release ( x, y, data, options )
// Called when the mouse button is released over a bead, or when a touch is lifted off a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.release = function (x, y, data, options) {
    // Uncomment the following line to inspect parameters
    // PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

    // Add code here for when the mouse button/touch is released over a bead
};

// PS.enter ( x, y, button, data, options )
// Called when the mouse/touch enters a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.enter = function (x, y, data, options) {
    // Uncomment the following line to inspect parameters
    // PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

    // Add code here for when the mouse cursor/touch enters a bead
    if(G.screen === "start" && PS.glyph(x, y) >= 49 && PS.glyph(x, y) <= 51){
        PS.border(x, y, 3);
        PS.borderColor(x, y, G.constants.RIGHT_COLOR);
    }
    else if(G.screen === "levelselect"){
        //light up the numbers when hovered over
        if(data[0] === "left"){
            PS.border( x, y, {
                top : 2,
                left : 2,
                bottom : 2,
                right : 0
            } );
            PS.border( x+1, y, {
                top : 2,
                left : 0,
                bottom : 2,
                right : 2
            } );
        }
        else if(data[0] === "right"){
            PS.border( x-1, y, {
                top : 2,
                left : 2,
                bottom : 2,
                right : 0
            } );
            PS.border( x, y, {
                top : 2,
                left : 0,
                bottom : 2,
                right : 2
            } );
        }
        else if(y === 13 && PS.glyph(x, y) !== 0){
            PS.border(6, 13, {top : 2, left : 2, bottom : 2});
            PS.border(7, 13, {top : 2, bottom : 2});
            PS.border(8, 13, {top : 2, bottom : 2});
            PS.border(9, 13, {top : 2, bottom : 2});
            PS.border(10, 13, {top : 2, bottom : 2});
            PS.border(11, 13, {top : 2, bottom : 2});
            PS.border(12, 13, {top : 2, bottom : 2});
            PS.border(13, 13, {top : 2, right : 2, bottom : 2});
        }
    }
    else if(G.screen === "play"){
        //back button
        if(x < 4 && y === 0){
            PS.border(0, 0, {bottom : 2});
            PS.border(1, 0, {bottom : 2});
            PS.border(2, 0, {bottom : 2});
            PS.border(3, 0, {bottom : 2, right : 2});
        }
        //chack button
        else if(x >= 15 && y === G.constants.HEIGHT-1 && PS.glyph(x, y) !== 0){
            PS.border(15, G.constants.HEIGHT-1, {left : 2, top : 2});
            PS.border(16, G.constants.HEIGHT-1, {top : 2});
            PS.border(17, G.constants.HEIGHT-1, {top : 2});
            PS.border(18, G.constants.HEIGHT-1, {top : 2});
            PS.border(19, G.constants.HEIGHT-1, {top : 2});
        }
    }
    else if(G.screen === "congrats"){
        //back button
        if(x < 4 && y === 0){
            PS.border(0, 0, {bottom : 2});
            PS.border(1, 0, {bottom : 2});
            PS.border(2, 0, {bottom : 2});
            PS.border(3, 0, {bottom : 2, right : 2});
        }
        //next button
        if(x >= 16 && y === 0){
            PS.border(16, 0, {left : 2, bottom : 2});
            PS.border(17, 0, {bottom : 2});
            PS.border(18, 0, {bottom : 2});
            PS.border(19, 0, {bottom : 2});
        }
    }
};

// PS.exit ( x, y, data, options )
// Called when the mouse cursor/touch exits a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.exit = function (x, y, data, options) {
    // Uncomment the following line to inspect parameters
    // PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

    // Add code here for when the mouse cursor/touch exits a bead
    if(G.screen === "start" && PS.glyph(x, y) >= 49 && PS.glyph(x, y) <= 51){
        PS.border(x, y, 0);
    }
    else if(G.screen === "levelselect"){
        if(data[0] === "left"){
            PS.border(x, y, 0);
            PS.border(x+1, y, 0);
        }
        else if(data[0] === "right"){
            PS.border(x-1, y, 0);
            PS.border(x, y, 0);
        }
        else if(y === 13 && PS.glyph(x, y) !== 0){
            PS.border(6, 13, 0);
            PS.border(7, 13, 0);
            PS.border(8, 13, 0);
            PS.border(9, 13, 0);
            PS.border(10, 13, 0);
            PS.border(11, 13, 0);
            PS.border(12, 13, 0);
            PS.border(13, 13, 0);
        }
    }
    else if(G.screen === "play"){
        //back button
        if(x < 4 && y === 0){
            PS.border(0, 0, 0);
            PS.border(1, 0, 0);
            PS.border(2, 0, 0);
            PS.border(3, 0, 0);
        }
        else if(x >= 15 && y === G.constants.HEIGHT-1){
            PS.border(15, G.constants.HEIGHT-1, 0);
            PS.border(16, G.constants.HEIGHT-1, 0);
            PS.border(17, G.constants.HEIGHT-1, 0);
            PS.border(18, G.constants.HEIGHT-1, 0);
            PS.border(19, G.constants.HEIGHT-1, 0);
        }

    }
    else if(G.screen === "congrats"){
        //back button
        if(x < 4 && y === 0){
            PS.border(0, 0, 0);
            PS.border(1, 0, 0);
            PS.border(2, 0, 0);
            PS.border(3, 0, 0);
        }
        //next button
        else if(x >= 16 && y === 0){
            PS.border(16, 0, 0);
            PS.border(17, 0, 0);
            PS.border(18, 0, 0);
            PS.border(19, 0, 0);
        }
    }
};

// PS.exitGrid ( options )
// Called when the mouse cursor/touch exits the grid perimeter
// It doesn't have to do anything
// [options] = an object with optional parameters; see documentation for details

PS.exitGrid = function (options) {
    // Uncomment the following line to verify operation
    // PS.debug( "PS.exitGrid() called\n" );

    // Add code here for when the mouse cursor/touch moves off the grid
};

// PS.keyDown ( key, shift, ctrl, options )
// Called when a key on the keyboard is pressed
// It doesn't have to do anything
// [key] = ASCII code of the pressed key, or one of the PS.KEY constants documented at:
// http://users.wpi.edu/~bmoriarty/ps/constants.html
// [shift] = true if shift key is held down, else false
// [ctrl] = true if control key is held down, else false
// [options] = an object with optional parameters; see documentation for details

PS.keyDown = function (key, shift, ctrl, options) {
    // Uncomment the following line to inspect parameters
    // PS.debug( "DOWN: key = " + key + ", shift = " + shift + "\n" );

    // Add code here for when a key is pressed
    //if there is a selected bead, set it in the selected
    //TODO: currently does not check if the key is actually a letter
    if(G.selectedBead.x !== null && G.selectedBead.y !== null){
        //if backspace is pressed
        if((key === 8 || key === 32) && G.selectedBead.x !== null){
            //remove the letter and deselect the bead
            removeCypherLetter(PS.glyph(G.selectedBead.x, G.selectedBead.y));
            selectBead(G.selectedBead.x, G.selectedBead.y);
        }
        else {
            updateCypher(String.fromCharCode(key).toUpperCase());
            var check = "CHECK";
            for(var i = 0; i < check.length; i++) {
                PS.glyph(15+i, G.constants.HEIGHT-1, check[i]);
                PS.borderColor(15+i, G.constants.HEIGHT-1, PS.COLOR_YELLOW);
            }
        }
    }
};

// PS.keyUp ( key, shift, ctrl, options )
// Called when a key on the keyboard is released
// It doesn't have to do anything
// [key] = ASCII code of the pressed key, or one of the PS.KEY constants documented at:
// http://users.wpi.edu/~bmoriarty/ps/constants.html
// [shift] = true if shift key is held down, false otherwise
// [ctrl] = true if control key is held down, false otherwise
// [options] = an object with optional parameters; see documentation for details

PS.keyUp = function (key, shift, ctrl, options) {
    // Uncomment the following line to inspect parameters
    // PS.debug( "PS.keyUp(): key = " + key + ", shift = " + shift + ", ctrl = " + ctrl + "\n" );

    // Add code here for when a key is released
};

// PS.input ( sensors, options )
// Called when an input device event (other than mouse/touch/keyboard) is detected
// It doesn't have to do anything
// [sensors] = an object with sensor information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

PS.input = function (sensors, options) {
    // Uncomment the following block to inspect parameters
    /*
     PS.debug( "PS.input() called\n" );
     var device = sensors.wheel; // check for scroll wheel
     if ( device )
     {
     PS.debug( "sensors.wheel = " + device + "\n" );
     }
     */

    // Add code here for when an input event is detected
};

// PS.swipe ( data, options )
// Called when the player swipes a held-down mouse or finger across or around the grid.
// It doesn't have to do anything
// [data] = an object with swipe information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

PS.swipe = function (data, options) {

    // Add code here for when a swipe event is detected
};

// PS.shutdown ( options )
// Called when the browser window running Perlenspiel is about to close
// It doesn't have to do anything
// [options] = an object with optional parameters; see documentation for details

PS.shutdown = function (options) {

    // Add code here for when Perlenspiel is about to close
};