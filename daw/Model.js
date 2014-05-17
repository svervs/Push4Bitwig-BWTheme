// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function Model (push)
{
	this.push = push;

	this.application = host.createApplication ();

	this.transport = new TransportProxy (push);
	this.masterTrack = new MasterTrackProxy (push);
	this.userControlBank = new UserControlBankProxy (push);

	this.noteInput = this.push.input.getPort().createNoteInput ("Ableton Push", "80????", "90????", "E0????", "B040??" /* Sustainpedal */);
	this.noteInput.setShouldConsumeEvents (false);

	this.scales = new Scales ();

	this.selectedDevice =
	{
		name: 'None',
		hasPreviousDevice: false,
		hasNextDevice: false
	};

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
				this.push.setPendingMode (MODE_TRACK);
			if (this.push.isActiveView (VIEW_PLAY))
				this.push.getActiveView ().updateNoteMapping ();
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

Model.prototype.setKeyTranslationTable = function (table)
{
	this.noteInput.setKeyTranslationTable (table);
};

/**
 * @returns {Scales}
 */
Model.prototype.getScales = function ()
{
	return this.scales;
};

Model.prototype.getSelectedTrack = function ()
{
	for (var i = 0; i < 8; i++)
	{
		if (this.tracks[i].selected)
			return this.tracks[i];
	}
	return null;
};

Model.prototype.hasSelectedDevice = function ()
{
	return this.selectedDevice.name != 'None';
};

Model.prototype.getSelectedDevice = function ()
{
	return this.selectedDevice;
};

/**
 * @returns {TransportProxy|
 */
Model.prototype.getTransport = function () { return this.transport; };

/**
 * @returns {MasterTrackProxy}
 */
Model.prototype.getMasterTrack = function () { return this.masterTrack; };

/**
 * @returns {UserControlBankProxy}
 */
Model.prototype.getUserControlBank = function () { return this.userControlBank; };

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