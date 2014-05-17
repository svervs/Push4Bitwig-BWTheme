// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

FixedMode.CLIP_LENGTHS = [ '1 Beat', '2 Beats', '1 Bar', '2 Bars', '4 Bars', '8 Bars', '16 Bars', '32 Bars' ];


function FixedMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_FIXED;
	this.fullDisplay = true;
}
FixedMode.prototype = new BaseMode ();

FixedMode.prototype.onFirstRow = function (index)
{
	currentNewClipLength = index;
};

FixedMode.prototype.updateDisplay = function ()
{
	var d = this.push.display;
	
	d.clearRow (0).done (0).clearRow (1).done (1)
	 .setBlock (2, 0, 'New Clip Length:').clearBlock (2, 1).clearBlock (2, 2).clearBlock (2, 3)
	 .done (2);
	for (var i = 0; i < 8; i++)
		d.setCell (3, i, (currentNewClipLength == i ? Display.RIGHT_ARROW : ' ') + FixedMode.CLIP_LENGTHS[i]);
	d.done (3);
	
	for (var i = 0; i < 8; i++)
	{
		this.push.setButton (20 + i, PUSH_COLOR_GREEN_LO-4);
		this.push.setButton (102 + i, PUSH_COLOR_BLACK);
	}	
};