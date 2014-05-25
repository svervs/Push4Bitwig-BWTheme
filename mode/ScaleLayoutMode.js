// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function ScaleLayoutMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_SCALE_LAYOUT;
	this.scales = model.getScales ();
	this.fullDisplay = true;
}
ScaleLayoutMode.prototype = new BaseMode ();

ScaleLayoutMode.prototype.onFirstRow = function (index)
{
	if (index > 5)
		return;
	this.scales.setScaleLayout (index);
	this.push.getActiveView ().updateNoteMapping ();
};

ScaleLayoutMode.prototype.updateDisplay = function ()
{
	var d = this.push.display;
	d.clearRow (0).clearRow (1).clearRow (2).setBlock (2, 0, 'Scale layout:');

	var sl = this.scales.getScaleLayout ();
	for (var i = 0; i < 8; i++)
	{
		var isSel = sl == i;
		if (i > 5)
			d.clearCell (3, i);
		else
			d.setCell (3, i, (isSel ? Display.RIGHT_ARROW : ' ') + Scales.LAYOUT_NAMES[i]);
			
		this.push.setButton (20 + i, i > 5 ? PUSH_COLOR_BLACK : (sl == i ? PUSH_COLOR_SCENE_YELLOW : PUSH_COLOR_SCENE_GREEN));
		this.push.setButton (102 + i, PUSH_COLOR_BLACK);
	}
	d.allDone ();
};