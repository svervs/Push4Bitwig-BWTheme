// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function ScalesMode (scales)
{
	this.scales = scales;
	this.id = MODE_SCALES;
}
ScalesMode.prototype = new BaseMode ();

var SKIPPER = false;
ScalesMode.prototype.onValueKnob = function (index, value)
{
	if (index == 0)
	{
		// Slow down scrolling
		SKIPPER = !SKIPPER;
		if (SKIPPER)
			return;
		if (value <= 61)
			this.scales.nextScale ();
		else
			this.scales.prevScale ();
		push.getActiveView ().updateNoteMapping ();
	}
};

ScalesMode.prototype.onFirstRow = function (index)
{
	if (index == 0)
		this.scales.prevScale ();
	else if (index > 0 && index < 7)
		this.scales.setScaleOffset (index - 1);
	push.getActiveView().updateNoteMapping ();
};

ScalesMode.prototype.onSecondRow = function (index)
{
	if (index == 0)
		this.scales.nextScale ();
	else if (index == 7)
		this.scales.toggleChromatic ();
	else
		this.scales.setScaleOffset (index + 5);
		
	push.getActiveView().updateNoteMapping ();
};

ScalesMode.prototype.updateDisplay = function ()
{
	var d = push.display;
	var scale = this.scales.getSelectedScale ();
	var offset = this.scales.getScaleOffset ();
	
	d.setBlock (0, 0, Display.RIGHT_ARROW + this.scales.getName (scale))
	 .clearBlock (0, 1)
	 .clearBlock (0, 2)
	 .setBlock (0, 3, this.scales.getRangeText ())
	 .done (0);
	 
	d.setBlock (1, 0, ' ' + this.scales.getName (scale + 1))
	 .clearBlock (1, 1)
	 .clearBlock (1, 2)
	 .clearBlock (1, 3)
	 .done (1);
	 
	d.setCell (2, 0, ' ' + this.scales.getName (scale + 2));
	for (var i = 0; i < 6; i++)
		d.setCell (2, i + 1, '  ' + (offset == i ? Display.RIGHT_ARROW : ' ') + Scales.BASES[i]);
	d.clearCell (2, 7).done (2);
	 
	d.setCell (3, 0, ' ' + this.scales.getName (scale + 3));
	for (var i = 6; i < 12; i++)
		d.setCell (3, i - 5, '  ' + (offset == i ? Display.RIGHT_ARROW : ' ') + Scales.BASES[i]);
	d.setCell (3, 7, this.scales.isChromatic () ? 'Chromatc' : 'In Key').done (3);

	for (var i = 0; i < 8; i++)
	{
		var isFirstOrLast = i == 0 || i == 7;
		push.setButton (20 + i, i == 7 ? PUSH_COLOR_BLACK : (isFirstOrLast ? PUSH_COLOR_ORANGE_LO : (offset == i - 1 ? PUSH_COLOR_SCENE_YELLOW : PUSH_COLOR_SCENE_GREEN)));
		push.setButton (102 + i, isFirstOrLast ? PUSH_COLOR_ORANGE_LO : (offset == (i - 1) + 6 ? PUSH_COLOR_YELLOW_LO : PUSH_COLOR_GREEN_LO));
	}
};