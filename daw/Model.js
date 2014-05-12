// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function Model ()
{
	this.application = host.createApplication ();

	this.tracks = [];
	this.recCount = 64;
	for (var i = 0; i < 8; i++)
	{
		this.tracks.push (
		{ 
			index: i,
			selected: false,
			sends: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }, { index: 5 }],
			slots: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }, { index: 5 }, { index: 6 }, { index: 7 }]
		});
	}
	
	this.master =
	{ 
		selected: false,
		canHoldNotes: false,
		sends: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }, { index: 5 }],
	};
	
	// Master Track name
	masterTrack.addNameObserver (8, '', doObject (this, function (name)
	{
		this.master.name = name;
	}));
	// Master Track selection
	masterTrack.addIsSelectedObserver (doObject (this, function (isSelected)
	{
		this.master.selected = isSelected;
		setMode (isSelected ? MODE_MASTER : previousMode);
	}));
	masterTrack.addVuMeterObserver (128, -1, true, doObject (this, function (value)
	{
		this.master.vu = value;
	}));
	
	// Master Track Mute
	masterTrack.getMute ().addValueObserver (doObject (this, function (isMuted)
	{
		this.master.mute = isMuted;
	}));
	// Master Track Solo
	masterTrack.getSolo ().addValueObserver (doObject (this, function (isSoloed)
	{
		this.master.solo = isSoloed;
	}));
	// Master Track Arm
	masterTrack.getArm ().addValueObserver (doObject (this, function (isArmed)
	{
		this.master.recarm = isArmed;
	}));
	
	// Master Track Pan value & text
	var p = masterTrack.getPan ();
	p.addValueObserver (128, doObject (this, function (value)
	{
		this.master.pan = value;
	}));
	p.addValueDisplayObserver (8, '', doObject (this, function (text)
	{
		this.master.panStr = text;
	}));
	
	// Master Track volume value & text
	var v = masterTrack.getVolume ();
	v.addValueObserver (128, doObject (this, function (value)
	{
		this.master.volume = value;
	}));
	v.addValueDisplayObserver (8, '', doObject (this, function (text)
	{
		this.master.volumeStr = text;
	}));
	
	for (var i = 0; i < 8; i++)
	{
		var t = trackBank.getTrack (i);
		
		// Track name
		t.addNameObserver (8, '', doObjectIndex (this, i, function (index, name)
		{
			this.tracks[index].name = name;
		}));
		// Track selection
		t.addIsSelectedObserver (doObjectIndex (this, i, function (index, isSelected)
		{
			this.tracks[index].selected = isSelected;
			if (isSelected && push.isActiveMode (MODE_MASTER))
				setMode (MODE_TRACK);
			if (push.isActiveView (VIEW_PLAY))
				push.getActiveView ().updateNoteMapping ();
		}));
		t.addVuMeterObserver (128, -1, true, doObjectIndex (this, i, function (index, value)
		{
			this.tracks[index].vu = value;
		}));
		
		// Track Mute
		t.getMute ().addValueObserver (doObjectIndex (this, i, function (index, isMuted)
		{
			this.tracks[index].mute = isMuted;
		}));
		// Track Solo
		t.getSolo ().addValueObserver (doObjectIndex (this, i, function (index, isSoloed)
		{
			this.tracks[index].solo = isSoloed;
		}));
		// Track Arm
		t.getArm ().addValueObserver (doObjectIndex (this, i, function (index, isArmed)
		{
			this.tracks[index].recarm = isArmed;
		}));
		
		// Track volume value & text
		var v = t.getVolume ();
		v.addValueObserver (128, doObjectIndex (this, i, function (index, value)
		{
			this.tracks[index].volume = value;
		}));
		v.addValueDisplayObserver (8, '', doObjectIndex (this, i, function (index, text)
		{
			this.tracks[index].volumeStr = text;
		}));
		
		// Track Pan value & text
		var p = t.getPan ();
		p.addValueObserver (128, doObjectIndex (this, i, function (index, value)
		{
			this.tracks[index].pan = value;
		}));
		p.addValueDisplayObserver (8, '', doObjectIndex (this, i, function (index, text)
		{
			this.tracks[index].panStr = text;
		}));

		// Can hold note data?
		t.getCanHoldNoteData ().addValueObserver (doObjectIndex (this, i, function (index, canHoldNotes)
		{
			this.tracks[index].canHoldNotes = canHoldNotes;
		}));
		
		// Slot content changes
		var cs = t.getClipLauncherSlots ();
		cs.addIsSelectedObserver (doObjectIndex (this, i, function (index, slot, isSelected)
		{
			this.tracks[index].slots[slot].isSelected = isSelected;
		}));
		cs.addHasContentObserver (doObjectIndex (this, i, function (index, slot, hasContent)
		{
			this.tracks[index].slots[slot].hasContent = hasContent;
		}));
		cs.addColorObserver (doObjectIndex (this, i, function (index, slot, red, green, blue)
		{
			this.tracks[index].slots[slot].color = getColorIndex (red, green, blue);
		}));
		cs.addIsPlayingObserver (doObjectIndex (this, i, function (index, slot, isPlaying)
		{
			this.tracks[index].slots[slot].isPlaying = isPlaying;
		}));
		cs.addIsRecordingObserver (doObjectIndex (this, i, function (index, slot, isRecording)
		{
			this.recCount = this.recCount + (isRecording ? 1 : -1);
			this.tracks[index].slots[slot].isRecording = isRecording;
		}));
		cs.addIsQueuedObserver (doObjectIndex (this, i, function (index, slot, isQueued)
		{
			this.tracks[index].slots[slot].isQueued = isQueued;
		}));
		
		// 6 Sends values & texts
		for (var j = 0; j < 6; j++)
		{
			var s = t.getSend (j);
			s.addValueObserver (128, doObjectDoubleIndex (this, i, j, function (index1, index2, value)
			{
				this.tracks[index1].sends[index2].volume = value;
			}));
			s.addValueDisplayObserver (8, '', doObjectDoubleIndex (this, i, j, function (index1, index2, text)
			{
				this.tracks[index1].sends[index2].volumeStr = text;
			}));
		}
	}
}

Model.prototype.getSelectedTrack = function ()
{
	for (var i = 0; i < 8; i++)
	{
		if (this.tracks[i].selected)
			return this.tracks[i];
	}
	return null;
};

Model.prototype.getMaster = function ()
{
	return this.master;
};

Model.prototype.getTrack = function (index)
{
	return this.tracks[index];
};

Model.prototype.getApplication = function ()
{
	return this.application;
};

Model.prototype.isClipRecording = function ()
{
	return this.recCount != 0;
};