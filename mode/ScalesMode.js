// Written by Jürgen Moßgraber - mossgrabers.de
// Contributions by Michael Schmalle
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function ScalesMode ()
{
	this.id = MODE_SCALES;
}
ScalesMode.prototype = new BaseMode ();

ScalesMode.prototype.attachTo = function (aPush) 
{
};

ScalesMode.prototype.updateDisplay = function ()
{
	var d = push.display;
	
	var o = 2 + currentOctave;
	var noteName = NOTE_NAMES[SCALE_OFFSETS[currentScaleOffset]];
	d.setBlock (0, 0, RIGHT_ARROW + SCALES[currentScale].name)
	 .clearBlock (0, 1)
	 .clearBlock (0, 2)
	 .setBlock (0, 3, noteName + o + ' to ' + noteName + (o + 4))
	 .done (0);
	 
	d.setBlock (1, 0, currentScale + 1 < SCALES.length ? ' ' + SCALES[currentScale + 1].name : '')
	 .clearBlock (1, 1)
	 .clearBlock (1, 2)
	 .clearBlock (1, 3)
	 .done (1);
	 
	d.setCell (2, 0, currentScale + 2 < SCALES.length ? ' ' + SCALES[currentScale + 2].name : '');
	for (var i = 0; i < 6; i++)
		d.setCell (2, i + 1, '  ' + (currentScaleOffset == i ? RIGHT_ARROW : ' ') + SCALE_BASES[i]);
	d.clearCell (2, 7).done (2);
	 
	d.setCell (3, 0, currentScale + 3 < SCALES.length ? ' ' + SCALES[currentScale + 3].name : '');
	for (var i = 6; i < 12; i++)
		d.setCell (3, i - 5, '  ' + (currentScaleOffset == i ? RIGHT_ARROW : ' ') + SCALE_BASES[i]);
	d.clearCell (3, 7).done (3);

	for (var i = 0; i < 8; i++)
	{
		push.setButton (20 + i, i == 0 || i == 7 ? PUSH_COLOR_ORANGE_LO : PUSH_COLOR_GREEN_LO-4);
		push.setButton (102 + i, i == 0 || i == 7 ? PUSH_COLOR_ORANGE_LO : PUSH_COLOR_GREEN_LO);
	}
};