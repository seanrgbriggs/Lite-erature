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
        PLAYAREA_COL: {r: 25, g: 25, b: 25},

        ALL_LETTERS: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    };

    var quotes = {list:(function() {
        return "THERE IS NO GREATER AGONY THAN BEARING AN UNTOLD STORY INSIDE YOU. \n-MAYA ANGELOU";
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

//initializes the cypher to be solved
//letters above will be the cyphered text
//black spaces below will contain the correct letter in their data field
function initCypher2(){
    //create the cyphered string from the original
    var cyphered = lm.encode(original).join("");

    //split the strings into their individual words
    var originalWords = original.split(" ");
    cyphered = cyphered.split(" ");

    var colOffset = 0;
    var rowOffset = 0;
    //go through every word in the string
    for(var i = 0; i < cyphered.length; i++){
        //move word to next line if it won't fit on current line
        if(colOffset + cyphered[i].length > G.constants.WIDTH){
            colOffset = 0;
            rowOffset += 2;
        }

        //go through every letter in each word
        for(var j = 0; j < cyphered[i].length; j++){
            //print every letter in the cyphered word
            PS.glyph(colOffset, rowOffset, cyphered[i][j]);

            //make the beads below them white, with the real letter in the data of the bead
            PS.color(colOffset, rowOffset+1, PS.COLOR_WHITE);
            PS.glyphColor(colOffset, rowOffset+1, PS.COLOR_BLACK);
            PS.border(colOffset, rowOffset+1, 2);
            PS.data(colOffset, rowOffset+1, originalWords[i][j]);

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

//function that displays the phrase to be decoded
//takes in string as input and writes it all, row by row
//does not split words but writes them on the next line
//TODO: can probably be combined with the init alphabet in order to gray out unused letters
function initCypher(original, cypher){
    var originalWords = original.split(" ");
    var cypherWords = cypher.split(" ");

    //print out each word
    var colOffset = 0;
    var rowOffset = 0;
    for(var i = 0; i < cypherWords.length; i++){
        //check if word would go past the edge of the grid and go to next line
        if(colOffset + cypherWords[i].length > G.constants.WIDTH || cypherWords[i][0] === "\n"){
            colOffset = 0;
            rowOffset++;
        }
        //print every letter of the word
        for(var j = 0; j < cypherWords[i].length; j++){
            PS.glyph(colOffset, rowOffset, cypherWords[i][j]);
            PS.data(colOffset, rowOffset, originalWords[i][j]);
            colOffset++;
        }
        //puts the empty space between words, as long as it's not the first column
        if(colOffset != 0) {
            colOffset++;
        }
        //moves to the next row if past the edge of the grid
        if(colOffset > G.constants.WIDTH){
            colOffset = 0;
            rowOffset++;
        }
    }
    return;
}

//update cypher with the new input data
function updateCypher(letter){
    //place the new letter in the new spot
    PS.glyph(selectedBead.x, selectedBead.y, letter);
    var originalWords = original.split(" ");
    var cypherLetter = PS.glyph(selectedBead.x, selectedBead.y-1);

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
            if(PS.glyph(colOffset, rowOffset-1) === cypherLetter){
                PS.glyph(colOffset, rowOffset, letter);
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
    /*
    //update all the occurrences of that letter in the cyphered string
    var letter;
    var encoded;
    //TODO fix so that it goes until the end of the string and not just 5 rows
    for(var row = 0; row < 5; row++){
        for(var col = 0; col < G.constants.WIDTH; col++){
            // if there is a glyph at that col, row
            if(PS.glyph(col, row) !== 0) {
                letter = String.fromCharCode(PS.glyph(selectedBead.x, selectedBead.y-1));
                encoded = lm.encode(PS.data(col, row))[0];
                //if the letter corresponds to the encoded letter
                if(letter === encoded) {
                    PS.glyph(col, row, PS.glyph(selectedBead.x, selectedBead.y));
                    PS.color(col, row, PS.COLOR_YELLOW);
                    PS.glyphColor(col, row, PS.COLOR_BLACK);
                }
            }
        }
    }
    */
    //deselect the bead after the operation is done
    selectBead(selectedBead.x, selectedBead.y);
}

//TODO: make so that it goes until the end of the string and not just 5 rows
function removeCypherLetter(){
    //remove all occurences of the letter in the cyphered string
    var letter;
    var encoded;
    for(var row = 0; row < 5; row++){
        for(var col = 0; col < G.constants.WIDTH; col++){
            if(PS.color(col, row) === PS.COLOR_YELLOW){
                //compare the values so that only that one is removed
                letter = String.fromCharCode(PS.glyph(selectedBead.x, selectedBead.y-1));
                encoded = lm.encode(PS.data(col, row))[0];
                if(letter === encoded){
                    //PS.glyph(col, row) === PS.glyph(selectedBead.x, selectedBead.y));
                    PS.glyph(col, row, lm.encode(PS.data(col, row))[0]);
                    PS.color(col, row, G.constants.PLAYAREA_COL);
                    PS.glyphColor(col, row, PS.COLOR_WHITE);
                }
            }
        }
    }

    //remove the letter from the selected space and deselect the selected space
    PS.glyph(selectedBead.x,  selectedBead.y, 0);
    //selectBead(selectedBead.x, selectedBead.y);
}

//prints the whole alphabet with the spaces below the letters for input
function initAlphabet(mapping){
    var colOffset = 0;
    var rowOffset = 0;
    //print out the letters of the alphabet
    for(var i = 0; i < 26; i++){
        //puts the alphabet at the bottom
        PS.glyph(colOffset, G.constants.HEIGHT-4+rowOffset, 65+i);
        PS.border(colOffset, G.constants.HEIGHT-4+rowOffset, 2);
        PS.border(colOffset, G.constants.HEIGHT-4+rowOffset, {bottom:0});
        //makes the white squares below the alphabet
        PS.color(colOffset, G.constants.HEIGHT-3+rowOffset, PS.COLOR_WHITE);
        PS.glyphColor(colOffset, G.constants.HEIGHT-3+rowOffset, PS.COLOR_BLACK);
        PS.border(colOffset, G.constants.HEIGHT-3+rowOffset, 2);
        PS.border(colOffset, G.constants.HEIGHT-3+rowOffset, {top:0});
        colOffset++;
        if(colOffset >= G.constants.WIDTH){
            colOffset = 0;
            rowOffset += 2;
        }
    }
}

//checks if the input values are correct
//TODO: fix it so that it uses selected square to do the remove letter and stuff
//TODO: remove the locking in function
//TODO: don't remove letters that are wrong, but rather signify that they are wrong
function checkCorrectness(){
    var colOffset = 0;
    var rowOffset = G.constants.HEIGHT-3;
    //print out the letters of the alphabet
    for(var i = 0; i < 26; i++){
        if(PS.glyph(colOffset, rowOffset) !== 0) {
            //PS.debug(String.fromCharCode(PS.glyph(colOffset, rowOffset))+" "+PS.data(colOffset, rowOffset)+"\n");
            //PS.debug(lm.encode(String.fromCharCode(PS.glyph(colOffset, rowOffset)))+"\n");
            //PS.debug(String.fromCharCode(PS.glyph(colOffset, rowOffset - 1))+"\n");
            //i know this is fugly but might come back and look at it
            if (String.fromCharCode(PS.glyph(colOffset, rowOffset - 1)) === lm.encode(String.fromCharCode(PS.glyph(colOffset, rowOffset)))[0]) {
                //lock it in
                PS.color(colOffset, rowOffset, PS.COLOR_YELLOW);
            }
            else{
                //remove it
                selectedBead.x = colOffset;
                selectedBead.y = rowOffset;
                removeCypherLetter(PS.glyph(colOffset, rowOffset));
            }
        }
        colOffset++;
        if(colOffset >= G.constants.WIDTH){
            colOffset = 0;
            rowOffset += 2;
        }
    }
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
var lm = new G.LetterMap();
var selectedBead = {
    x: null,
    y: null
};

PS.init = function (system, options) {
    //setup the grid
    PS.gridSize(G.constants.WIDTH, G.constants.HEIGHT);
    PS.gridColor(G.constants.BG_COL);
    PS.color(PS.ALL, PS.ALL, G.constants.PLAYAREA_COL);
    PS.border(PS.ALL, PS.ALL, 0);
    PS.borderColor(PS.ALL, PS.ALL, PS.COLOR_BLACK);
    PS.glyphColor(PS.ALL, PS.ALL, PS.COLOR_WHITE);
    //initialize the cyphered text
    original = G.quotes.list;
    initCypher2();
    //initCypher(G.quotes.list, mixed.join(""));
    //initAlphabet(lm);
    //PS.glyph(G.constants.WIDTH-1, G.constants.HEIGHT-1, "?");
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
    if(PS.color(x, y) === PS.COLOR_WHITE) {
        selectBead(x, y);
    }
    //else deselect the bead if there is one selected and clicking on an non input bead
    else if(selectedBead.x !== null && selectedBead.y !== null){
        selectBead(selectedBead.x, selectedBead.y);
    }

    //if clicking the check button
    if(x === G.constants.WIDTH-1 && y === G.constants.HEIGHT-1){
        checkCorrectness();
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