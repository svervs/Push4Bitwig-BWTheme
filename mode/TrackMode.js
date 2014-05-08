// Written by Jürgen Moßgraber - mossgrabers.de
// Contributions by Michael Schmalle
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function TrackMode ()
{
	this.id = MODE_TRACK;
}
TrackMode.prototype = new BaseMode ();

TrackMode.prototype.attachTo = function (aPush) 
{
	for (var i = 0; i < 8; i++)
	{
		var t = trackBank.getTrack (i);
		
		// Track name
		t.addNameObserver (8, '', doIndex (i, function (index, name)
		{
			tracks[index].name = name;
		}));
		// Track selection
		t.addIsSelectedObserver (doIndex (i, function (index, isSelected)
		{
			tracks[index].selected = isSelected;
			if (isSelected)
				setMode (MODE_TRACK);
			if (push.isActiveView (VIEW_PLAY))
				push.getActiveView ().updateNoteMapping ();
		}));
		
		// Track Mute
		t.getMute ().addValueObserver (doIndex (i, function (index, isMuted)
		{
			tracks[index].mute = isMuted;
		}));
		// Track Solo
		t.getSolo ().addValueObserver (doIndex (i, function (index, isSoloed)
		{
			tracks[index].solo = isSoloed;
		}));
		// Track Arm
		t.getArm ().addValueObserver (doIndex (i, function (index, isArmed)
		{
			tracks[index].recarm = isArmed;
		}));
		
		// Track volume value & text
		var v = t.getVolume ();
		v.addValueObserver (128, doIndex (i, function (index, value)
		{
			tracks[index].volume = value;
		}));
		v.addValueDisplayObserver (8, '', doIndex (i, function (index, text)
		{
			tracks[index].volumeStr = text;
		}));
		
		// Track Pan value & text
		var p = t.getPan ();
		p.addValueObserver (128, doIndex (i, function (index, value)
		{
			tracks[index].pan = value;
		}));
		p.addValueDisplayObserver (8, '', doIndex (i, function (index, text)
		{
			tracks[index].panStr = text;
		}));

		// Can hold note data?
		t.getCanHoldNoteData ().addValueObserver (doIndex (i, function (index, canHoldNotes)
		{
			tracks[index].canHoldNotes = canHoldNotes;
		}));
		
		// Slot content changes
		var cs = t.getClipLauncherSlots ();
		cs.addIsSelectedObserver (doIndex (i, function (index, slot, isSelected)
		{
			tracks[index].slots[slot].isSelected = isSelected;
		}));
		cs.addHasContentObserver (doIndex (i, function (index, slot, hasContent)
		{
			tracks[index].slots[slot].hasContent = hasContent;
		}));
		cs.addColorObserver (doIndex (i, function (index, slot, red, green, blue)
		{
			tracks[index].slots[slot].color = getColorIndex (red, green, blue);
		}));
		cs.addIsPlayingObserver (doIndex (i, function (index, slot, isPlaying)
		{
			tracks[index].slots[slot].isPlaying = isPlaying;
		}));
		cs.addIsRecordingObserver (doIndex (i, function (index, slot, isRecording)
		{
			tracks[index].slots[slot].isRecording = isRecording;
		}));
		cs.addIsQueuedObserver (doIndex (i, function (index, slot, isQueued)
		{
			tracks[index].slots[slot].isQueued = isQueued;
		}));
		
		// 6 Sends values & texts
		for (var j = 0; j < 6; j++)
		{
			var s = t.getSend (j);
			s.addValueObserver (128, doDoubleIndex (i, j, function (index1, index2, value)
			{
				tracks[index1].sends[index2].volume = value;
			}));
			s.addValueDisplayObserver (8, '', doDoubleIndex (i, j, function (index1, index2, text)
			{
				tracks[index1].sends[index2].volumeStr = text;
			}));
		}
	}
};

TrackMode.prototype.onValueKnob = function (index, value)
{
	var selectedTrack = getSelectedTrack ();
	if (selectedTrack == null)
		return;
		
	var t = trackBank.getTrack (selectedTrack.index);
	if (index == 0)
	{
		// Volume
		selectedTrack.volume = changeValue (value, selectedTrack.volume);
		t.getVolume ().set (selectedTrack.volume, 128);
	}
	else if (index == 1)
	{
		// Pan
		selectedTrack.pan = changeValue (value, selectedTrack.pan);
		t.getPan ().set (selectedTrack.pan, 128);
	}
	else
	{
		// Send 1-6 Volume
		var sel = index - 2;
		var send = selectedTrack.sends[sel];
		send.volume = changeValue (value, send.volume);
		t.getSend (send.index).set (send.volume, 128);
	}
};

TrackMode.prototype.updateDisplay = function ()
{
	var t = getSelectedTrack ();
	var d = push.display;
	
	d.setRow (0, PARAM_NAMES_TRACK);
	if (t == null)
		d.clearRow (1).done (1).clearRow (2).done (2);
	else
	{
		d.setCell (1, 0, t.volumeStr, PushDisplay.FORMAT_RAW)
		 .setCell (1, 1, t.panStr, PushDisplay.FORMAT_RAW)
		 .setCell (1, 2, t.sends[0].volumeStr, PushDisplay.FORMAT_RAW)
		 .setCell (1, 3, t.sends[1].volumeStr, PushDisplay.FORMAT_RAW)
		 .setCell (1, 4, t.sends[2].volumeStr, PushDisplay.FORMAT_RAW)
		 .setCell (1, 5, t.sends[3].volumeStr, PushDisplay.FORMAT_RAW)
		 .setCell (1, 6, t.sends[4].volumeStr, PushDisplay.FORMAT_RAW)
		 .setCell (1, 7, t.sends[5].volumeStr, PushDisplay.FORMAT_RAW)
		 .done (1)
		
		 .setCell (2, 0, t.volume, PushDisplay.FORMAT_VALUE)
		 .setCell (2, 1, t.pan, PushDisplay.FORMAT_PAN)
		 .setCell (2, 2, t.sends[0].volume, PushDisplay.FORMAT_VALUE)
		 .setCell (2, 3, t.sends[1].volume, PushDisplay.FORMAT_VALUE)
		 .setCell (2, 4, t.sends[2].volume, PushDisplay.FORMAT_VALUE)
		 .setCell (2, 5, t.sends[3].volume, PushDisplay.FORMAT_VALUE)
		 .setCell (2, 6, t.sends[4].volume, PushDisplay.FORMAT_VALUE)
		 .setCell (2, 7, t.sends[5].volume, PushDisplay.FORMAT_VALUE)
		 .done (2);
	}
};
