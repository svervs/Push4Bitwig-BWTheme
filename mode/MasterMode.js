// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

MasterMode.PARAM_NAMES = 'Volume   Pan                                                        ';


function MasterMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_MASTER;
}
MasterMode.prototype = new BaseMode ();

MasterMode.prototype.onValueKnob = function (index, value)
{
	var master = this.model.getMaster ();
	if (index == 0)
	{
		// Volume
		master.volume = this.changeValue (value, master.volume);
		masterTrack.getVolume ().set (master.volume, 128);
	}
	else if (index == 1)
	{
		// Pan
		master.pan = this.changeValue (value, master.pan);
		masterTrack.getPan ().set (master.pan, 128);
	}
};

MasterMode.prototype.updateDisplay = function ()
{
	var d = push.display;
	var master = this.model.getMaster ();
	
	d.setRow (0, MasterMode.PARAM_NAMES)
	 .setCell (1, 0, master.volumeStr, Display.FORMAT_RAW)
	 .setCell (1, 1, master.panStr, Display.FORMAT_RAW)
	 .clearCell (1, 2).clearCell (1, 3).clearCell (1, 4).clearCell (1, 5)
	 .clearCell (1, 6).clearCell (1, 7).done (1)
	
	 .setCell (2, 0, master.volume, Display.FORMAT_VALUE)
	 .setCell (2, 1, master.pan, Display.FORMAT_PAN)
	 .clearCell (2, 2).clearCell (2, 3).clearCell (2, 4).clearCell (2, 5)
	 .clearCell (2, 6).clearCell (2, 7).done (2)
	
	 .setCell (3, 0, master.name, Display.FORMAT_RAW)
	 .clearCell (3, 1).clearCell (3, 2).clearCell (3, 3).clearCell (3, 4).clearCell (3, 5)
	 .clearCell (3, 6).clearCell (3, 7).done (3);

	for (var i = 0; i < 8; i++)
	{
		push.setButton (20 + i, PUSH_COLOR_BLACK);
		push.setButton (102 + i, PUSH_COLOR_BLACK);
	}
};
