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

//var LIT_COLORS = [0xff0080, 0xff0000, 0xff8000, 0xffff00,
  //  0x80ff00, 0x00ff00, 0x00ff80, 0x00ffff,
////0x0080ff, 0x0000ff, 0x8000ff, 0xff00ff];

var G= (function () {
    var MIDDLE_C_PIANO = 60;
    var BG_COL = PS.COLOR_BLACK;
	var HIGHLIGHT_COL = 0xF0F0F0;
    var BEAD_RADIUS = 20;
	var MAX_WIDTH = 32;
	var MIN_TEMPO = 10;
	var MAX_TEMPO = 150;
	var LIT_COLORS = [0xff0080, 0xff0000, 0xff8000, 0xffff00,
        0x80ff00, 0x00ff00];
    LIT_COLORS = LIT_COLORS.concat(LIT_COLORS.reverse());

    var UNLIT_COLORS = LIT_COLORS.map(function (col) {
		function dim(col, mask) {
			return ((col & mask) / 2) & mask;
        }
		return dim(col, 0xff)+dim(col,0xff00)+dim(col,0xff0000);
    })
    var HEIGHT = LIT_COLORS.length;

    var PLAY_BUTTON = {x:16, y:HEIGHT, playglyph:"▶", pauseglyph:"⏸"};


	var width, columns, currentColumn, tempo, octave,tempoTimerPtr;
    width = MAX_WIDTH / 3;
	columns = [];
    for(var q = 0; q < MAX_WIDTH; q++){
            columns.push(0);
	}
	tempo = 50;
	currentColumn = -1;


    function GridIterator(sizeX, sizeY) {
        return {
			x:0,y:0,width:sizeX,height:sizeY,
			isDone: function () {
				return this.y >= this.height;
            },
			next: function () {
				this.x++;
				if(this.x >= this.width){
					this.x = 0;
					this.y++;
				}
            }
		};
    }

    function addCol() {
        if(width < MAX_WIDTH -1) {
            width++;
            columns.push(0x0);
            for(var y = 0; y < HEIGHT; y += 1){
                PS.color(width, y, UNLIT_COLORS[y]);
                PS.alpha(width, y, 60);
                PS.borderColor(width, y, PS.DEFAULT);
            }
        }
    }

    function remCol() {
        if(width >= 4) {
            width--;
            columns.pop();
            for (var y = 0; y < HEIGHT; y++) {
                PS.color(width + 1, y, PS.COLOR_BLACK);
                PS.alpha(width + 1, y, 255);
                PS.borderColor(width+1, y, PS.COLOR_BLACK);
            }
            //PS.debug(width + "\n" + columns.length + "\n");
        }
    }

    function switchBead(x, y) {

		var rowMask, isBeadLit;
        if(x > width){
            return;
        }

        rowMask = 0x1 << y;

		columns[x] = columns[x] ^ (rowMask);
        isBeadLit = columns[x] & rowMask;
        //PS.debug(isBeadLit+"\n");
        if(isBeadLit){
            PS.color(x,y,LIT_COLORS[y]);
            PS.alpha (x, y, 255);
        }else{
            PS.color(x,y,UNLIT_COLORS[y]);
            PS.alpha ( x, y, 60 )
        }
    }

    function playCol() {
        var y;
        for(y = 0; y<HEIGHT; y++){
            //if the square is lit

            if(columns[currentColumn] & (1 << y)) {
                //PS.debug(columns[currentColumn] ^ (1 << y)+"\n");
                PS.audioPlay(PS.piano(MIDDLE_C_PIANO + (HEIGHT-y-1)));
            }
        }
    }

    //function for the tempo and playing the music
    function tempoTimer(){
        currentColumn += 1; // increment counter
        if ( currentColumn > width) {
            currentColumn = 0;
        }
        PS.borderColor(currentColumn, G.constants.HEIGHT, PS.DEFAULT);

        G.playCol(currentColumn);
        if(currentColumn>0) {
            for(var y = 0; y < HEIGHT; y += 1) {
               PS.borderColor(currentColumn - 1, y, PS.DEFAULT);
            }
        }
        else{
            for(var y = 0; y < HEIGHT; y += 1) {
                PS.borderColor(width, y, PS.DEFAULT);
            }
        }
        for(var y = 0; y < HEIGHT; y += 1) {
            PS.borderColor(currentColumn, y, PS.COLOR_RED);
        }
    }

    function changeTempo(x){
        //if decreasing the tempo, can't go too fast
        var stopped = false;
        if(tempoTimerPtr) {
            PS.timerStop(tempoTimerPtr);
            stopped = true;
        }
        if(x < 0 && tempo > MIN_TEMPO) {
            tempo += x;
            //PS.debug("faster!\n");
        }
        else if(x > 0 && tempo < MAX_TEMPO){
            tempo += x;
            //PS.debug("slower!\n");
        }
        if(stopped) {
            tempoTimerPtr = PS.timerStart(tempo, tempoTimer);
        }
    }

	function pausePlay() {
		if(!tempoTimerPtr){
            tempoTimerPtr = PS.timerStart(tempo, tempoTimer);
			//PS.glyph(PLAY_BUTTON.x, PLAY_BUTTON.y, PLAY_BUTTON.playglyph);
			//play button
            PS.color(17, HEIGHT+1, PS.COLOR_WHITE);
            PS.color(17, HEIGHT+3, PS.COLOR_WHITE);
            PS.color(15, HEIGHT+1, PS.COLOR_BLACK);
            PS.color(15, HEIGHT+2, PS.COLOR_BLACK);
            PS.color(15, HEIGHT+3, PS.COLOR_BLACK);
            PS.color(16, HEIGHT+1, PS.COLOR_BLACK);
            PS.border(16, HEIGHT+1, {top:20});
            PS.borderColor(16, HEIGHT+1, PS.COLOR_WHITE);
            PS.color(16, HEIGHT+2, PS.COLOR_BLACK);
            PS.border(16, HEIGHT+3, {bottom:20});
            PS.borderColor(16, HEIGHT+3, PS.COLOR_WHITE);
            PS.color(16, HEIGHT+3, PS.COLOR_BLACK);
            PS.color(17, HEIGHT+2, PS.COLOR_BLACK);

		}else{
			PS.timerStop(tempoTimerPtr);
			tempoTimerPtr = false;
            //PS.glyph(PLAY_BUTTON.x, PLAY_BUTTON.y, PLAY_BUTTON.pauseglyph);
            PS.color(15, HEIGHT+1, PS.COLOR_BLACK);
            PS.color(15, HEIGHT+2, PS.COLOR_BLACK);
            PS.color(15, HEIGHT+3, PS.COLOR_BLACK);
            PS.color(16, HEIGHT+1, PS.COLOR_WHITE);
            PS.color(16, HEIGHT+2, PS.COLOR_WHITE);
            PS.color(16, HEIGHT+3, PS.COLOR_WHITE);
            PS.color(17, HEIGHT+1, PS.COLOR_BLACK);
            PS.color(17, HEIGHT+2, PS.COLOR_BLACK);
            PS.color(17, HEIGHT+3, PS.COLOR_BLACK);
		}
    }
    return {
		constants:{
			MAX_WIDTH:MAX_WIDTH,
            LIT_COLORS:LIT_COLORS,
			UNLIT_COLORS:UNLIT_COLORS,
			HEIGHT:HEIGHT,
            BG_COL:BG_COL
		},
		GridIterator:GridIterator,
		switchBead:switchBead,
		playCol:playCol,
		pausePlay:pausePlay,
        changeTempo:changeTempo,
        addCol:addCol,
        remCol:remCol,
        width:width
	};
}());

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

PS.init = function( system, options ) {
    var gi, x;

	PS.gridSize( G.constants.MAX_WIDTH, G.constants.HEIGHT + 5 );
    PS.gridColor (G.constants.BG_COL);
    //PS.gridColor(PS.COLOR_BLACK)
    for(gi = new G.GridIterator(G.width, G.constants.HEIGHT); !gi.isDone(); gi.next()){
        PS.color(gi.x, gi.y, G.constants.UNLIT_COLORS[gi.y]);
    }
   for(gi = new G.GridIterator(G.constants.MAX_WIDTH - (G.width + 1), G.constants.HEIGHT); !gi.isDone(); gi.next()){
       PS.color((G.width + 1)+gi.x, gi.y, PS.COLOR_BLACK);
       PS.alpha((G.width + 1)+gi.x , gi.y, 255);
       PS.borderColor((G.width + 1)+gi.x, gi.y, PS.COLOR_BLACK);
   }


    PS.alpha (PS.ALL, PS.ALL, 60);
    PS.border(PS.ALL, G.constants.HEIGHT, 0);
    PS.border(PS.ALL, G.constants.HEIGHT+1, 0);
    PS.border(PS.ALL, G.constants.HEIGHT+2, 0);
    PS.border(PS.ALL, G.constants.HEIGHT+3, 0);
    PS.border(PS.ALL, G.constants.HEIGHT+4, 0);
    PS.alpha(PS.ALL, G.constants.HEIGHT, 255);
    PS.alpha(PS.ALL, G.constants.HEIGHT+1, 255);
    PS.alpha(PS.ALL, G.constants.HEIGHT+2, 255);
    PS.alpha(PS.ALL, G.constants.HEIGHT+3, 255);
    PS.alpha(PS.ALL, G.constants.HEIGHT+4, 255);


    //minus button
    PS.color(1, G.constants.HEIGHT+2, PS.COLOR_RED);
    PS.color(2, G.constants.HEIGHT+2, PS.COLOR_RED);
    PS.color(3, G.constants.HEIGHT+2, PS.COLOR_RED);

    //plus button
    PS.color(5, G.constants.HEIGHT+2, PS.COLOR_RED);
    PS.color(6, G.constants.HEIGHT+2, PS.COLOR_RED);
    PS.color(7, G.constants.HEIGHT+2, PS.COLOR_RED);
    PS.color(6, G.constants.HEIGHT+1, PS.COLOR_RED);
    PS.color(6, G.constants.HEIGHT+3, PS.COLOR_RED);

    //addcol button
    PS.color(30, G.constants.HEIGHT+2, PS.COLOR_BLACK);
    PS.color(29, G.constants.HEIGHT+1, PS.COLOR_BLACK);
    PS.color(29, G.constants.HEIGHT+2, PS.COLOR_BLACK);
    PS.color(29, G.constants.HEIGHT+3, PS.COLOR_BLACK);
    PS.color(28, G.constants.HEIGHT+2, PS.COLOR_BLACK);

    //remcol button
    PS.color(24, G.constants.HEIGHT+2, PS.COLOR_BLACK);
    PS.color(25, G.constants.HEIGHT+2, PS.COLOR_BLACK);
    PS.color(26, G.constants.HEIGHT+2, PS.COLOR_BLACK);


    //preload all of the piano notes
    for(x = 60; x <= 72; x += 1) {
        PS.audioLoad(PS.piano(x));
    }
    G.pausePlay();

};


// PS.touch ( x, y, data, options )
// Called when the mouse button is clicked on a bead, or when a bead is touched
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details


PS.touch = function( x, y, data, options ) {
	// Uncomment the following line to inspect parameters
	//PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );
	if(y < G.constants.HEIGHT) {
        G.switchBead(x, y);
    }
    //increase the tempo
    else if(x >= 1 && x <= 3){
	    G.changeTempo(10);
    }
    //decrease the tempo
    else if(x >= 5 && x <= 7){
        G.changeTempo(-10);
    }
    else if(x >= 15 && x <= 17){
        G.pausePlay();
    }
    //decrease the width
    else if(x >= 24 && x <= 26){
        G.remCol();
    }
    //increase the width
    else if(x >= 28 && x <= 30){
        G.addCol();
    }
	// Add code here for mouse clicks/touches over a bead
};


// PS.release ( x, y, data, options )
// Called when the mouse button is released over a bead, or when a touch is lifted off a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.release = function( x, y, data, options ) {
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

PS.enter = function( x, y, data, options ) {
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

PS.exit = function( x, y, data, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead
};

// PS.exitGrid ( options )
// Called when the mouse cursor/touch exits the grid perimeter
// It doesn't have to do anything
// [options] = an object with optional parameters; see documentation for details

PS.exitGrid = function( options ) {
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

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following line to inspect parameters
	//	PS.debug( "DOWN: key = " + key + ", shift = " + shift + "\n" );

	// Add code here for when a key is pressed
    // play/pause when spacebar is pressed
    if(key === 32) {
        G.pausePlay();
    }
    else if(key === PS.KEY_ARROW_LEFT){
        G.remCol();
    }
    else if(key === PS.KEY_ARROW_RIGHT){
        G.addCol();
    }
    else if(key === PS.KEY_ARROW_DOWN){
        G.changeTempo(10);
    }
    else if(key === PS.KEY_ARROW_UP){
        G.changeTempo(-10);
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

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.keyUp(): key = " + key + ", shift = " + shift + ", ctrl = " + ctrl + "\n" );

	// Add code here for when a key is released
};

// PS.input ( sensors, options )
// Called when an input device event (other than mouse/touch/keyboard) is detected
// It doesn't have to do anything
// [sensors] = an object with sensor information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

PS.input = function( sensors, options ) {
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

PS.swipe = function( data, options ) {

	// Add code here for when a swipe event is detected
};

// PS.shutdown ( options )
// Called when the browser window running Perlenspiel is about to close
// It doesn't have to do anything
// [options] = an object with optional parameters; see documentation for details

PS.shutdown = function( options ) {

	// Add code here for when Perlenspiel is about to close
};