// Written by Jürgen Moßgraber - mossgrabers.de
// Contributions by Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function PanMode ()
{
	this.id = MODE_PAN;
}
PanMode.prototype = new BaseMode ();

PanMode.prototype.attachTo = function (aPush) 
{
	// Master Track Pan value & text
	var p = masterTrack.getPan ();
	p.addValueObserver (128, function (value)
	{
		master.pan = value;
	});
	p.addValueDisplayObserver (8, '', function (text)
	{
		master.panStr = text;
	});
};

PanMode.prototype.onValueKnob = function (index, value)
{
	var t = tracks[index];
	t.pan = changeValue (value, t.pan);
	trackBank.getTrack (t.index).getPan ().set (t.pan, 128);
};

PanMode.prototype.updateDisplay = function ()
{
	var d = push.display;
	
	for (var i = 0; i < 8; i++)
	{
		d.setCell (1, i, tracks[i].panStr, PushDisplay.FORMAT_RAW)
		 .setCell (2, i, tracks[i].pan, PushDisplay.FORMAT_PAN);
	}
	d.setRow (0, PARAM_NAMES_PAN).done (1).done (2);
};
