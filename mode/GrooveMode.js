// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function GrooveMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_GROOVE;
	this.fullDisplay = true;
}
GrooveMode.prototype = new BaseMode ();

GrooveMode.prototype.attachTo = function (aPush)
{
	BaseMode.prototype.attachTo (aPush);
	// add observers in GrooveProxy
};

GrooveMode.prototype.onValueKnob = function (index, value)
{
	var v = push.groove.getValue (index);
	v.value = this.changeValue (value, v.value);
	push.groove.getRangedValue (index).set (v.value, 128);
};

GrooveMode.prototype.onFirstRow = function (index)
{
	switch (index)
	{
		case 7:
			this.push.groove.toggleEnabled ();
			break;
	}
};

GrooveMode.prototype.updateDisplay = function ()
{
	var d = this.push.display;
	var g = this.push.groove;

	d.clear ();

	var kinds = GrooveValue.Kind.values ();
	for (var i = 0; i < kinds.length; i++)
	{
		var v = g.getValue (i);
		d.setCell (0, i, v.name, Display.FORMAT_RAW)
		 .setCell (1, i, v.valueString, Display.FORMAT_RAW)
		 .setCell (2, i, v.value, Display.FORMAT_VALUE);
	}

	d.setBlock (3, 0, "Global Groove:");
	d.setCell (3, 7, g.isEnabled () ? 'Enabled' : 'Disabled');

	d.done (0).done (1).done (2).done (3);

	for (var i = 0; i < 7; i++)
		this.push.setButton (20 + i, PUSH_COLOR_BLACK);

	for (var i = 0; i < 8; i++)
		this.push.setButton (102 + i, PUSH_COLOR_BLACK);

	this.push.setButton (27, g.isEnabled () ? PUSH_COLOR_GREEN_LO - 4 : PUSH_COLOR_BLACK);
};
