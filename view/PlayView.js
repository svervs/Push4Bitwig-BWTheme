// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function PlayView (model)
{
	BaseView.call (this, model);
	this.scales = model.getScales ();
	this.noteMap = this.scales.getEmptyMatrix ();
	this.pressedKeys = initArray (0, 128);
	this.defaultVelocity = [];
	for (var i = 0; i < 128; i++)
		this.defaultVelocity.push (i);
	Config.addPropertyListener (Config.FIXED_ACCENT_VALUE, doObject (this, function ()
	{
		this.initMaxVelocity ();
	}));
}
PlayView.prototype = new BaseView ();

PlayView.prototype.updateNoteMapping = function ()
{
	var t = this.model.getTrackBank ().getSelectedTrack ();
	this.noteMap = t != null && t.canHoldNotes ? this.scales.getNoteMatrix () : this.scales.getEmptyMatrix ();
	// Workaround: https://github.com/git-moss/Push4Bitwig/issues/7
	host.scheduleTask (doObject (this, function () { this.push.setKeyTranslationTable (this.noteMap); }), null, 100);
};

PlayView.prototype.onActivate = function ()
{
	BaseView.prototype.onActivate.call (this);

	this.push.setButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_HI);
	this.push.setButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_ACCENT, Config.accentActive ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	for (var i = 0; i < 8; i++)
		this.model.getTrackBank ().getClipLauncherSlots (i).setIndication (false);
	this.updateSceneButtons ();
	this.initMaxVelocity ();
};

PlayView.prototype.updateSceneButtons = function (buttonID)
{
	for (var i = 0; i < 8; i++)
		this.push.setButton (PUSH_BUTTON_SCENE1 + i, PUSH_COLOR_BLACK);
};

PlayView.prototype.usesButton = function (buttonID)
{
	switch (buttonID)
	{
		case PUSH_BUTTON_REPEAT:
		case PUSH_BUTTON_SELECT:
		case PUSH_BUTTON_ADD_EFFECT:
		case PUSH_BUTTON_ADD_TRACK:
		case PUSH_BUTTON_USER_MODE:
		case PUSH_BUTTON_DUPLICATE:
		case PUSH_BUTTON_CLIP:
			return false;
	}
	return true;
};

PlayView.prototype.drawGrid = function ()
{
	var t = this.model.getTrackBank ().getSelectedTrack ();
	var isKeyboardEnabled = t != null && t.canHoldNotes;
	var isRecording = this.model.getTransport ().isRecording || this.model.getTrackBank ().isClipRecording ();
	for (var i = 36; i < 100; i++)
	{
		this.push.pads.light (i, isKeyboardEnabled ? (this.pressedKeys[i] > 0 ?
			(isRecording ? PUSH_COLOR_RED_HI : PUSH_COLOR_GREEN_HI) : 
			this.scales.getColor (this.noteMap, i)) : PUSH_COLOR_BLACK);
		this.push.pads.blink (i, PUSH_COLOR_BLACK);
	}
};

PlayView.prototype.onGrid = function (note, velocity)
{
	var t = this.model.getTrackBank ().getSelectedTrack ();
	if (t == null || !t.canHoldNotes)
		return;
	// Mark selected notes
	for (var i = 0; i < 128; i++)
	{
		if (this.noteMap[note] == this.noteMap[i])
			this.pressedKeys[i] = velocity;
	}
};

PlayView.prototype.onOctaveDown = function (event)
{
	if (!event.isDown ())
		return;
	this.scales.decOctave ();
	this.updateNoteMapping ();
};

PlayView.prototype.onOctaveUp = function (event)
{
	if (!event.isDown ())
		return;
	this.scales.incOctave ();
	this.updateNoteMapping ();
};

PlayView.prototype.onUp = function (event)
{
	if (!event.isDown ())
		return;
	if (this.push.isShiftPressed ())
		this.model.getApplication ().arrowKeyLeft ();
	else
		this.model.getApplication ().arrowKeyUp ();
};

PlayView.prototype.onDown = function (event)
{
	if (!event.isDown ())
		return;
	if (this.push.isShiftPressed ())
		this.model.getApplication ().arrowKeyRight ();
	else
		this.model.getApplication ().arrowKeyDown ();
};

PlayView.prototype.onLeft = function (event)
{
	if (!event.isDown ())
		return;

	if (this.push.getCurrentMode () == MODE_BANK_DEVICE || this.push.getCurrentMode () == MODE_PRESET)
		this.model.getCursorDevice ().selectPrevious ();
	else
	{
		var sel = this.model.getTrackBank ().getSelectedTrack ();
		var index = sel == null ? 0 : sel.index - 1;
		if (index == -1)
		{
			if (!this.model.getTrackBank ().canScrollTrackUp ())
				return;
			this.model.getTrackBank ().scrollTracksPageUp ();
			host.scheduleTask (doObject (this, this.selectTrack), [7], 100);
			return;
		}
		this.selectTrack (index);
	}
};

PlayView.prototype.onRight = function (event)
{
	if (!event.isDown ())
		return;

	if (this.push.getCurrentMode () == MODE_BANK_DEVICE || this.push.getCurrentMode () == MODE_PRESET)
		this.model.getCursorDevice ().selectNext ();
	else
	{
		var sel = this.model.getTrackBank ().getSelectedTrack ();
		var index = sel == null ? 0 : sel.index + 1;
		if (index == 8)
		{
			if (!this.model.getTrackBank ().canScrollTrackDown ())
				return;
			this.model.getTrackBank ().scrollTracksPageDown ();
			host.scheduleTask (doObject (this, this.selectTrack), [0], 100);
		}
		this.selectTrack (index);
	}
};

PlayView.prototype.onAccent = function (event)
{
	BaseView.prototype.onAccent.call (this, event);
	if (event.isUp ())
		this.initMaxVelocity ();
};

PlayView.prototype.initMaxVelocity = function ()
{
	this.maxVelocity = initArray (Config.fixedAccentValue, 128);
	this.maxVelocity[0] = 0;
	this.push.setVelocityTranslationTable (Config.accentActive ? this.maxVelocity : this.defaultVelocity);
};
