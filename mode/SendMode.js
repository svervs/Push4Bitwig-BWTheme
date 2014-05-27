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

function SendMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_SEND;
}
SendMode.prototype = new BaseMode ();

SendMode.prototype.onValueKnob = function (index, value)
{
	var sendIndex = this.getCurrentSendIndex ();
	this.model.getTrackBank ().setSend (index, sendIndex, value);
};

SendMode.prototype.updateDisplay = function ()
{
	var d = this.push.display;
	var sendIndex = this.getCurrentSendIndex ();
	for (var i = 0; i < 8; i++)
	{
		var t = this.model.getTrackBank ().getTrack (i);
		d.setCell (1, i, t.sends[sendIndex].volumeStr, Display.FORMAT_RAW)
		 .setCell (2, i, t.sends[sendIndex].volume, Display.FORMAT_VALUE);
	}
	d.setRow (0, SendMode.PARAM_NAMES[sendIndex]).done (1).done (2);
};

SendMode.prototype.getCurrentSendIndex = function ()
{
	return this.push.getCurrentMode () - MODE_SEND1;
};
