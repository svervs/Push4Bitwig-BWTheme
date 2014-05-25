// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

// Push character codes for value bars
Display.BARS_NON    = String.fromCharCode (6);
Display.BARS_ONE    = String.fromCharCode (3);
Display.BARS_TWO    = String.fromCharCode (5);
Display.BARS_ONE_L  = String.fromCharCode (4);
Display.NON_4       = Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON;
Display.RIGHT_ARROW = String.fromCharCode (127);

Display.SPACES =
[
	'',
	' ',
	'  ',
	'   ',
	'    ',
	'     ',
	'      ',
	'       ',
	'        ',
	'         '
];

Display.DASHES =
[
	'',
	Display.BARS_NON,
	Display.BARS_NON + Display.BARS_NON,
	Display.BARS_NON + Display.BARS_NON + Display.BARS_NON,
	Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON,
	Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON,
	Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON,
	Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON,
	Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON,
	Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON + Display.BARS_NON
];

Display.SYSEX_CLEAR =
[
	"F0 47 7F 15 18 00 45 00 ",
	"F0 47 7F 15 19 00 45 00 ",
	"F0 47 7F 15 1A 00 45 00 ",
	"F0 47 7F 15 1B 00 45 00 "
];

Display.SYSEX_MESSAGE =
[
	"F0 47 7F 15 1C 00 00 F7",
	"F0 47 7F 15 1D 00 00 F7",
	"F0 47 7F 15 1E 00 00 F7",
	"F0 47 7F 15 1F 00 00 F7"
];

Display.FORMAT_RAW   = 0;
Display.FORMAT_VALUE = 1;
Display.FORMAT_PAN   = 2;


// 4 rows (0-3) with 4 blocks (0-3). Each block consists of 
// 17 characters or 2 cells (0-7).
function Display (output)
{
	this.output = output;
	this.currentMessage = initArray (null, 4);
	this.message = initArray (null, 4);
	
	this.cells = initArray (null, 4 * 8);
}

Display.prototype.setRow = function (row, str)
{
	this.message[row] = str;
	return this;
};

Display.prototype.clear = function ()
{
	for (var i = 0; i < 4; i++)
		this.clearRow (i);
	return this;
};

Display.prototype.clearRow = function (row)
{
	for (var i = 0; i < 4; i++)
		this.clearBlock (row, i);
	return this;
};

Display.prototype.clearColumn = function (column)
{
	for (var i = 0; i < 4; i++)
		this.clearBlock (i, column);
	return this;
};

Display.prototype.setBlock = function (row, block, value)
{
	var cell = 2 * block;
	if (value.length > 9)
	{
		this.cells[row * 8 + cell]     = value.substr (0, 9);
		this.cells[row * 8 + cell + 1] = this.pad (value.substring (9), 8, ' ');
	}
	else
	{
		this.cells[row * 8 + cell] = this.pad (value, 9, ' ');
		this.clearCell (row, cell + 1);
	}
	return this;
};

Display.prototype.clearBlock = function (row, block)
{
	var cell = 2 * block;
	this.clearCell (row, cell);
	this.clearCell (row, cell + 1);
	return this;
};

Display.prototype.setCell = function (row, cell, value, format)
{
	this.cells[row * 8 + cell] = this.pad (this.formatStr (value, format), 8, ' ') + (cell % 2 == 0 ? ' ' : '');
	return this;
};

Display.prototype.clearCell = function (row, cell)
{
	this.cells[row * 8 + cell] = cell % 2 == 0 ? '         ' : '        ';
	return this;
};

Display.prototype.done = function (row)
{
	var index = row * 8;
	this.message[row] = '';
	for (var i = 0; i < 8; i++)
		this.message[row] += this.cells[index + i];
	return this;
};

Display.prototype.allDone = function ()
{
	for (var row = 0; row < 4; row++)
		this.done (row);
	return this;
};

Display.prototype.flush = function (row)
{
	for (var row = 0; row < 4; row++)
	{
		if (this.currentMessage[row] == this.message[row])
			continue;
		this.currentMessage[row] = this.message[row];
		if (this.currentMessage[row] == null)
			this.output.sendSysex (Display.SYSEX_CLEAR[row]);
		else
		{
			var array = [];
			for (var i = 0; i < this.currentMessage[row].length; i++)
				array[i] = this.currentMessage[row].charCodeAt(i);
			this.output.sendSysex (Display.SYSEX_CLEAR[row] + toHexStr (array) + "F7");
		}
	}
};

Display.prototype.formatValue = function (value)
{
	var noOfBars = Math.round (16 * value / 128);
	var n = '';
	for (var j = 0; j < Math.floor (noOfBars / 2); j++)
		n += Display.BARS_TWO;
	if (noOfBars % 2 == 1)
		n += Display.BARS_ONE;
	return this.pad (n, 8, Display.BARS_NON);
};

Display.prototype.formatPan = function (pan)
{
	if (pan == 64)
	 	return Display.NON_4 + Display.NON_4;
	var isLeft = pan < 64;
	var pos = isLeft ? 64 - pan : pan - 64;
	var noOfBars = Math.round (16 * pos / 128);
	var n = '';
	for (var i = 0; i < Math.floor (noOfBars / 2); i++)
		n += Display.BARS_TWO;
	if (noOfBars % 2 == 1)
		n += isLeft ? Display.BARS_ONE_L : Display.BARS_ONE;
	n = Display.NON_4 + this.pad (n, 4, Display.BARS_NON);
	return isLeft ? this.reverseStr (n) : n;
};

Display.prototype.pad = function (str, length, character)
{
	if (typeof (str) == 'undefined' || str == null)
		str = '';
	var diff = length - str.length;
	if (diff < 0)
		return str.substr (0, length);
	if (diff > 0)
		return str + (character == ' ' ? Display.SPACES[diff] : Display.DASHES[diff]);
	return str;
};

Display.prototype.formatStr = function (value, format)
{
	switch (format)
	{
		case Display.FORMAT_VALUE:
			return this.formatValue (value);
		case Display.FORMAT_PAN:
			return this.formatPan (value);
		default:
			return value.toString ();
	}
};

Display.prototype.reverseStr = function (str)
{
	var r = '';
	for (var i = 0; i < str.length; i++)
		r = str[i] + r;
	return r;
};
