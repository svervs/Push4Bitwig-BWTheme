// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function TrackBankProxy (push)
{
	this.push = push;

	this.trackBank = host.createMainTrackBank (8, 6, 8);

	this.canScrollTrackUpFlag   = false;
	this.canScrollTrackDownFlag = false;

	this.newClipLength = 2; // 1 Bar

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
		var t = this.trackBank.getTrack (i);

		// Track name
		t.addNameObserver (8, '', doObjectIndex (this, i, function (index, name)
		{
			//println(index + ", " + name);
			this.tracks[index].name = name;
		}));
		// Track selection
		t.addIsSelectedObserver (doObjectIndex (this, i, function (index, isSelected)
		{
			this.tracks[index].selected = isSelected;
			if (isSelected && this.push.isActiveMode (MODE_MASTER))
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

	this.trackBank.addCanScrollTracksDownObserver (doObject (this, function (canScroll)
	{
		this.canScrollTrackDownFlag = canScroll;
	}));
	this.trackBank.addCanScrollTracksUpObserver (doObject (this, function (canScroll)
	{
		this.canScrollTrackUpFlag = canScroll;
	}));
}

TrackBankProxy.prototype.isClipRecording = function () { return this.recCount != 0; };
TrackBankProxy.prototype.getNewClipLength = function () { return this.newClipLength; };
TrackBankProxy.prototype.setNewClipLength = function (value) { this.newClipLength = value; };

/**
 * @returns {Track}
 */
TrackBankProxy.prototype.getSelectedTrack = function ()
{
	for (var i = 0; i < 8; i++)
	{
		if (this.tracks[i].selected)
			return this.tracks[i];
	}
	return null;
};

TrackBankProxy.prototype.selectTrack = function (index)
{
	var t = this.trackBank.getTrack (index);
	if (t != null)
		t.select ();
}

TrackBankProxy.prototype.canScrollTrackDown = function ()
{
	return this.canScrollTrackDownFlag;
};

TrackBankProxy.prototype.canScrollTrackUp = function ()
{
	return this.canScrollTrackUpFlag;
};

TrackBankProxy.prototype.getCurrentSendIndex = function ()
{
	return this.push.getCurrentMode () - MODE_SEND1;
};

TrackBankProxy.prototype.getTrack = function (index)
{
	return this.tracks[index];
};

TrackBankProxy.prototype.setVolume = function (index, value)
{
	var t = this.getTrack (index);
	t.volume = this.changeValue (value, t.volume);
	this.trackBank.getTrack (t.index).getVolume ().set (t.volume, 128);
};

TrackBankProxy.prototype.setPan = function (index, value)
{
	var t = this.getTrack (index);
	t.pan = this.changeValue (value, t.pan);
	this.trackBank.getTrack (t.index).getPan ().set (t.pan, 128);
};

TrackBankProxy.prototype.setMute = function (index, value)
{
	this.getTrack (index).mute = value;
	this.trackBank.getTrack (index).getMute ().set (value);
};

TrackBankProxy.prototype.setSolo = function (index, value)
{
	this.getTrack (index).solo = value;
	this.trackBank.getTrack (index).getSolo ().set (value);
};

TrackBankProxy.prototype.setArm = function (index, value)
{
	this.getTrack (index).recarm = value;
	this.trackBank.getTrack (index).getArm ().set (value);
};

TrackBankProxy.prototype.toggleMute = function (index)
{
	this.setMute (index, !this.getTrack (index).mute);
};

TrackBankProxy.prototype.toggleSolo = function (index)
{
	this.setSolo (index, !this.getTrack (index).solo);
};

TrackBankProxy.prototype.toggleArm = function (index)
{
	this.setArm (index, !this.getTrack (index).recarm);
};

TrackBankProxy.prototype.setSend = function (index, sendIndex, value)
{
	var t = this.getTrack (index);
	var send = t.sends[sendIndex];
	send.volume = this.changeValue (value, send.volume);
	this.trackBank.getTrack (t.index).getSend (sendIndex).set (send.volume, 128);
};

TrackBankProxy.prototype.scrollTracksPageUp = function ()
{
	this.trackBank.scrollTracksPageUp ();
};

TrackBankProxy.prototype.stop = function (index)
{
	this.trackBank.getTrack (index).stop ();
};

TrackBankProxy.prototype.select = function (index)
{
	this.trackBank.getTrack (index).select ();
};

TrackBankProxy.prototype.scrollTracksPageUp = function ()
{
	this.trackBank.scrollTracksPageUp ();
};

/**
 * @param index
 * @returns {ClipLauncherSlots}
 */
TrackBankProxy.prototype.getClipLauncherSlots = function (index)
{
	// TODO (mschmalle) Need container? [getClipLauncherSlots]
	return this.trackBank.getTrack (index).getClipLauncherSlots ();
};

/**
 * @returns {ClipLauncherScenesOrSlots}
 */
TrackBankProxy.prototype.getClipLauncherScenes = function ()
{
	// TODO (mschmalle) Need container? [getClipLauncherScenes]
	return this.trackBank.getClipLauncherScenes ();
};

TrackBankProxy.prototype.launchScene = function (scene)
{
	this.trackBank.launchScene (scene);
};

TrackBankProxy.prototype.returnToArrangement = function (index)
{
	this.trackBank.getTrack (index).returnToArrangement ();
};

TrackBankProxy.prototype.scrollTracksUp = function ()
{
	this.trackBank.scrollTracksUp ();
};

TrackBankProxy.prototype.scrollTracksDown = function ()
{
	this.trackBank.scrollTracksDown ();
};

TrackBankProxy.prototype.scrollTracksPageUp = function ()
{
	this.trackBank.scrollTracksPageUp ();
};

TrackBankProxy.prototype.scrollTracksPageDown = function ()
{
	this.trackBank.scrollTracksPageDown ();
};


TrackBankProxy.prototype.scrollScenesUp = function ()
{
	this.trackBank.scrollScenesUp ();
};

TrackBankProxy.prototype.scrollScenesDown = function ()
{
	this.trackBank.scrollScenesDown ();
};

TrackBankProxy.prototype.scrollScenesPageUp = function ()
{
	this.trackBank.scrollScenesPageUp ();
};

TrackBankProxy.prototype.scrollScenesPageDown = function ()
{
	this.trackBank.scrollScenesPageDown ();
};

// TODO (mschmalle) get this in utility, MasterTrack uses it as well
TrackBankProxy.prototype.changeValue = function (control, value)
{
	return control <= 61 ? Math.min (value + BaseMode.INC_FRACTION_VALUE, 127) : Math.max (value - BaseMode.INC_FRACTION_VALUE, 0);
}