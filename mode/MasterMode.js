// Written by Jürgen Moßgraber - mossgrabers.de
// Contributions by Michael Schmalle
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function MasterMode ()
{
	this.id = MODE_MASTER;
}
MasterMode.prototype = new BaseMode ();

MasterMode.prototype.attachTo = function (aPush) 
{
	// Master Track name
	masterTrack.addNameObserver (8, '', function (name)
	{
		master.name = name;
	});
	// Master Track selection
	masterTrack.addIsSelectedObserver (function (isSelected)
	{
		master.selected = isSelected;
		setMode (isSelected ? MODE_MASTER : previousMode);
	});
	
	// Master Track Mute
	masterTrack.getMute ().addValueObserver (function (isMuted)
	{
		master.mute = isMuted;
	});
	// Master Track Solo
	masterTrack.getSolo ().addValueObserver (function (isSoloed)
	{
		master.solo = isSoloed;
	});
	// Master Track Arm
	masterTrack.getArm ().addValueObserver (function (isArmed)
	{
		master.recarm = isArmed;
	});
};

MasterMode.prototype.onValueKnob = function (index, value)
{
	if (index == 0)
	{
		// Volume
		master.volume = changeValue (value, master.volume);
		masterTrack.getVolume ().set (master.volume, 128);
	}
	else if (index == 1)
	{
		// Pan
		master.pan = changeValue (value, master.pan);
		masterTrack.getPan ().set (master.pan, 128);
	}
};

MasterMode.prototype.updateDisplay = function ()
{
	var d = push.display;
	
	d.setRow (0, PARAM_NAMES_MASTER)
	 .setCell (1, 0, master.volumeStr, PushDisplay.FORMAT_RAW)
	 .setCell (1, 1, master.panStr, PushDisplay.FORMAT_RAW)
	 .clearCell (1, 2).clearCell (1, 3).clearCell (1, 4).clearCell (1, 5)
	 .clearCell (1, 6).clearCell (1, 7).done (1)
	
	 .setCell (2, 0, master.volume, PushDisplay.FORMAT_VALUE)
	 .setCell (2, 1, master.pan, PushDisplay.FORMAT_PAN)
	 .clearCell (2, 2).clearCell (2, 3).clearCell (2, 4).clearCell (2, 5)
	 .clearCell (2, 6).clearCell (2, 7).done (2)
	
	 .setCell (3, 0, master.name, PushDisplay.FORMAT_RAW)
	 .clearCell (3, 1).clearCell (3, 2).clearCell (3, 3).clearCell (3, 4).clearCell (3, 5)
	 .clearCell (3, 6).clearCell (3, 7).done (3);

	for (var i = 0; i < 8; i++)
	{
		push.setButton (20 + i, PUSH_COLOR_BLACK);
		push.setButton (102 + i, PUSH_COLOR_BLACK);
	}
};
