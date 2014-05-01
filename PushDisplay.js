// Push character codes for value bars
var BARS_NON = String.fromCharCode (6);
var BARS_ONE = String.fromCharCode (3);
var BARS_TWO = String.fromCharCode (5);
var BARS_ONE_L = String.fromCharCode (4);
var NON_4 = BARS_NON + BARS_NON + BARS_NON + BARS_NON;
var RIGHT_ARROW = String.fromCharCode (127);

var SYSEX_CLEAR =
[
	"F0 47 7F 15 18 00 45 00 ",
	"F0 47 7F 15 19 00 45 00 ",
	"F0 47 7F 15 1A 00 45 00 ",
	"F0 47 7F 15 1B 00 45 00 "
];

var SYSEX_MESSAGE =
[
	"F0 47 7F 15 1C 00 00 F7",
	"F0 47 7F 15 1D 00 00 F7",
	"F0 47 7F 15 1E 00 00 F7",
	"F0 47 7F 15 1F 00 00 F7"
];


function PushDisplay (output)
{
	this.output = output;
	this.currentMessage = initArray (null, 4);
	this.message = initArray (null, 4);
}

PushDisplay.prototype.sendRow = function (row, str)
{
	this.message[row] = str;
};

PushDisplay.prototype.clearRow = function (row)
{
	this.message[row] = null;
};

PushDisplay.prototype.flush = function (row)
{
	for (var row = 0; row < 4; row++)
	{
		if (this.currentMessage[row] == this.message[row])
			continue;
		this.currentMessage[row] = this.message[row];
		if (this.currentMessage[row] == null)
			this.output.sendSysex (SYSEX_CLEAR[row]);
		else
		{
			var array = [];
			for (var i = 0; i < this.currentMessage[row].length; i++)
				array[i] = this.currentMessage[row].charCodeAt(i);
			this.output.sendSysex (SYSEX_CLEAR[row] + toHexStr (array) + "F7");
		}
	}
};
