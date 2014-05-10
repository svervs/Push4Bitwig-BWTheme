// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

SendMode.PARAM_NAMES   =
[
	'Send 1   Send 1  Send 1   Send 1  Send 1   Send 1  Send 1   Send 1  ',
	'Send 2   Send 2  Send 2   Send 2  Send 2   Send 2  Send 2   Send 2  ',
	'Send 3   Send 3  Send 3   Send 3  Send 3   Send 3  Send 3   Send 3  ',
	'Send 4   Send 4  Send 4   Send 4  Send 4   Send 4  Send 4   Send 4  ',
	'Send 5   Send 5  Send 5   Send 5  Send 5   Send 5  Send 5   Send 5  ',
	'Send 6   Send 6  Send 6   Send 6  Send 6   Send 6  Send 6   Send 6  '
];


function SendMode ()
{
	this.id = MODE_SEND;
}
SendMode.prototype = new BaseMode ();

SendMode.prototype.onValueKnob = function (index, value)
{
	var sendNo = currentMode - MODE_SEND1;
	var t = tracks[index];
	var send = t.sends[sendNo];
	send.volume = this.changeValue (value, send.volume);
	trackBank.getTrack (t.index).getSend (sendNo).set (send.volume, 128);
};

SendMode.prototype.updateDisplay = function ()
{
	var d = push.display;
	var sendNo = currentMode - MODE_SEND1;
	for (var i = 0; i < 8; i++)
	{
		d.setCell (1, i, tracks[i].sends[sendNo].volumeStr, Display.FORMAT_RAW)
		 .setCell (2, i, tracks[i].sends[sendNo].volume, Display.FORMAT_VALUE);
	}
	d.setRow (0, SendMode.PARAM_NAMES[sendNo]).done (1).done (2);
};