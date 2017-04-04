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
        BG_COL: PS.COLOR_BLACK,
        WRONG_COL: 255*65536+100*256+100,
        PLAYAREA_COL: {r: 25, g: 25, b: 25},

        ALL_LETTERS: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    };

    var quotes = {list:(function() {
        return ["THERE IS NO GREATER AGONY THAN BEARING AN UNTOLD STORY INSIDE YOU. -MAYA ANGELOU",
                "He who fights with monsters might take care lest he thereby become a monster. And if you gaze for long into an abyss, the abyss gazes also into you."];
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
        quotes:quotes,
        LetterMap: LetterMap
    };
}());

//initializes the starting menu for the project
//TODO: this is fugly
function initStartMenu() {
    screen = "start";
    //select the difficulty and then immediately go to the quote
    var diff = "DIFFICULTY";
    for(var i = 0; i < diff.length; i++){
        PS.glyph(5+i, 9, diff[i]);
    }

    PS.glyph(5, 11, "1");
    PS.glyph(9, 11, "2");
    PS.glyph(13, 11, "3");
}

//initializes the cypher to be solved
//letters above will be the cyphered text
//black spaces below will contain the correct letter in their data field
function initCypher(){
    //create the cyphered string from the original
    var cyphered = lm.encode(original).join("");

    //split the strings into their individual words
    var originalWords = original.split(" ");
    cyphered = cyphered.split(" ");

    var colOffset = 0;
    var rowOffset = 0;
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

    var revealed;
    switch (difficulty){
        case 1:
            revealed = "RSTLNE";
            break;
        case 2:
            revealed = "THE";
            break;
        case 3:
            break;
    }
    for(var i = 0; i < revealed.length; i++){
        updateCypher(revealed[i]);
    }

    PS.glyph(G.constants.WIDTH-1, G.constants.HEIGHT-1, "?");
}

//update cypher with the new input data
function updateCypher(letter){
    //place the new letter in the new spot
    if(selectedBead.x !== null) {
        PS.glyph(selectedBead.x, selectedBead.y, letter);
    }
    var originalWords = original.split(" ");
    var cypherLetter;

    if(selectedBead.x !== null) {
        cypherLetter = PS.glyph(selectedBead.x, selectedBead.y - 1);
    }
    else{
        cypherLetter = lm.encode(letter)[0];
    }

    //go through the entire cypher
    var colOffset = 0;
    var rowOffset = 1;
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
                if(selectedBead.x === null){
                    PS.color(colOffset, rowOffset, PS.COLOR_YELLOW);
                }
                else {
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
    if(selectedBead.x !== null) {
        selectBead(selectedBead.x, selectedBead.y);
    }
}

//removes the letter in the selected space from the rest of the cypher
function removeCypherLetter(){

    var originalWords = original.split(" ");
    var letter = PS.glyph(selectedBead.x, selectedBead.y);

    //go through the entire cypher
    var colOffset = 0;
    var rowOffset = 1;
    for(var i = 0; i < originalWords.length; i++){

        //move word to next line if it won't fit on current line
        if(colOffset + originalWords[i].length > G.constants.WIDTH){
            colOffset = 0;
            rowOffset += 2;
        }

        for(var j = 0; j < originalWords[i].length; j++){
            //PS.glyph(colOffset, rowOffset, PS.data(colOffset, rowOffset));
            if(PS.glyph(colOffset, rowOffset) === letter){
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
    selectBead(selectedBead.x, selectedBead.y);
}

//checks if the input values are correct
function checkCorrectness(){
    //place the new letter in the new spot
    var originalWords = original.split(" ");

    //go through the entire cypher
    var colOffset = 0;
    var rowOffset = 1;
    for(var i = 0; i < originalWords.length; i++){
        //move word to next line if it won't fit on current line
        if(colOffset + originalWords[i].length > G.constants.WIDTH){
            colOffset = 0;
            rowOffset += 2;
        }

        for(var j = 0; j < originalWords[i].length; j++){
            if(PS.color(colOffset, rowOffset) === PS.COLOR_WHITE && PS.glyph(colOffset, rowOffset) !== 0){
                //if it's incorrect, mark it as such
                if(String.fromCharCode(PS.glyph(colOffset, rowOffset-1)) !== lm.encode(String.fromCharCode(PS.glyph(colOffset, rowOffset)))[0]){
                    PS.color(colOffset, rowOffset, G.constants.WRONG_COL);
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
    selectBead(selectedBead.x, selectedBead.y);
}

//function to check to see if the cypher is completely solved
//TODO: check completion of the puzzle when prompted
function checkCompletion(){

}


//function to select an empty bead
function selectBead(x, y){

    //deselect the previous selected bead
    if(selectedBead.x !== null && selectedBead.y !== null) {
        PS.border(selectedBead.x, selectedBead.y, 2);
        PS.borderColor(selectedBead.x, selectedBead.y, PS.COLOR_BLACK);
    }
    //select the new bead if its not the same one
    if(selectedBead.x !== x || selectedBead.y !== y) {
        PS.border(x, y, 4);
        PS.borderColor(x, y, PS.COLOR_RED);
        selectedBead.x = x;
        selectedBead.y = y;
    }
    else{
        selectedBead.x = null;
        selectedBead.y = null;
    }
}

function resetGrid(){
    PS.color(PS.ALL, PS.ALL, G.constants.PLAYAREA_COL);
    PS.border(PS.ALL, PS.ALL, 0);
    PS.borderColor(PS.ALL, PS.ALL, PS.COLOR_BLACK);
    PS.glyph(PS.ALL, PS.ALL, 0);
    PS.glyphColor(PS.ALL, PS.ALL, PS.COLOR_WHITE);
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

var original;
var difficulty;
var screen;
var lm = new G.LetterMap();
var selectedBead = {
    x: null,
    y: null
};

PS.init = function (system, options) {
    //setup the grid
    PS.gridSize(G.constants.WIDTH, G.constants.HEIGHT);
    PS.gridColor(G.constants.BG_COL);
    resetGrid();
    //initialize the cyphered text, all uppercase letters just in case also
    original = G.quotes.random().toUpperCase();
    difficulty = 1;
    //initCypher();
    initStartMenu();
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
    if(screen === "start"){
        if(PS.glyph(x, y) >= 49 && PS.glyph(x, y) <= 51){
            difficulty = PS.glyph(x, y) - 48;
            screen = "play";
            resetGrid();
            initCypher();

        }
    }
    else {
        if (PS.color(x, y) === PS.COLOR_WHITE || PS.color(x, y) === G.constants.WRONG_COL) {
            selectBead(x, y);
        }
        //else deselect the bead if there is one selected and clicking on an non input bead
        else if (selectedBead.x !== null && selectedBead.y !== null) {
            selectBead(selectedBead.x, selectedBead.y);
        }

        //if clicking the check button
        if (PS.glyph(x, y) === 63) {
            checkCorrectness();
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
    if(screen === "start" && PS.glyph(x, y) >= 49 && PS.glyph(x, y) <= 51){
        PS.border(x, y, 3);
        PS.borderColor(x, y, PS.COLOR_YELLOW);
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
    if(screen === "start" && PS.glyph(x, y) >= 49 && PS.glyph(x, y) <= 51){
        PS.border(x, y, 0);
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
    if(selectedBead.x !== null && selectedBead.y !== null){
        //if backspace is pressed
        if(key === 8 && selectedBead.x !== null){
            //remove the letter and deselect the bead
            removeCypherLetter(PS.glyph(selectedBead.x, selectedBead.y));
            selectBead(selectedBead.x, selectedBead.y);
        }
        else {
            updateCypher(String.fromCharCode(key).toUpperCase());
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