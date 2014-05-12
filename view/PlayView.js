// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function PlayView (model, scales)
{
	BaseView.call (this, model);
	this.scales = scales;
	this.pressedKeys = initArray (0, 128);
	this.maxVelocity = initArray (127, 128);
	this.maxVelocity[0] = 0;
	this.defaultVelocity = [];
	for (var i = 0; i < 128; i++)
		this.defaultVelocity.push (i);
}
PlayView.prototype = new BaseView ();

PlayView.prototype.updateNoteMapping = function ()
{
	var t = this.model.getSelectedTrack ();
	var noteMap = t != null && t.canHoldNotes ? this.scales.getNoteMatrix () : this.scales.getEmptyMatrix ();
	// Workaround: https://github.com/git-moss/Push4Bitwig/issues/7
	host.scheduleTask (function () { noteInput.setKeyTranslationTable (noteMap); }, null, 100);
};

PlayView.prototype.onActivate = function ()
{
	BaseView.prototype.onActivate.call (this);

	this.push.setButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_HI);
	this.push.setButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_ON);
	for (var i = 0; i < 8; i++)
		trackBank.getTrack (i).getClipLauncherSlots ().setIndication (false);
	this.updateSceneButtons ();
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
		case PUSH_BUTTON_NEW:
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
	var t = this.model.getSelectedTrack ();
	var isKeyboardEnabled = t != null && t.canHoldNotes;
	for (var i = 36; i < 100; i++)
		this.push.pads.light (i, isKeyboardEnabled ? (this.pressedKeys[i] > 0 ? (this.push.transport.isRecording || this.model.isClipRecording () ? PUSH_COLOR_RED_HI : PUSH_COLOR_GREEN_HI) : this.scales.getColor (i)) : PUSH_COLOR_BLACK);
};

PlayView.prototype.onGrid = function (note, velocity)
{
	var t = this.model.getSelectedTrack ();
	if (t == null || !t.canHoldNotes)
		return;

	// Remember pressed pads
	this.pressedKeys[note] = velocity;

	var index = note - 36;
	if (index % 8 > 2 && index + 5 < 64)
		this.pressedKeys[Math.min (note + 5, 127)] = velocity;
	if (index % 8 < 5 && index - 5 > 0)
		this.pressedKeys[Math.max (note - 5, 0)] = velocity;
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
	
	if (currentMode == MODE_DEVICE || currentMode == MODE_PRESET)
		device.selectPrevious ();
	else
	{
		var sel = this.model.getSelectedTrack ();
		var index = sel == null ? 0 : sel.index - 1;
		if (index == -1)
		{
			if (!canScrollTrackUp)
				return;
			trackBank.scrollTracksPageUp ();
			host.scheduleTask (selectTrack, [7], 100);
			return;
		}
		selectTrack (index);
	}
};

PlayView.prototype.onRight = function (event)
{
	if (!event.isDown ())
		return;
	
	if (currentMode == MODE_DEVICE || currentMode == MODE_PRESET)
		device.selectNext ();
	else
	{
		var sel = this.model.getSelectedTrack ();
		var index = sel == null ? 0 : sel.index + 1;
		if (index == 8)
		{
			if (!canScrollTrackDown)
				return;
			trackBank.scrollTracksPageDown ();
			host.scheduleTask (selectTrack, [0], 100);
		}
		selectTrack (index);
	}
};

PlayView.prototype.onAccent = function (event)
{
	BaseView.prototype.onAccent.call (this, event);
	noteInput.setVelocityTranslationTable (this.accentActive ? this.maxVelocity : this.defaultVelocity);
};
