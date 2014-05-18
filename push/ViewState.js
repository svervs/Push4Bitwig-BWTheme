// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function ViewState (push, model)
{
	this.push = push;
	this.model = model;

	this.activeViewId = -1;
	this.views = [];

	this.buttons =
	[
		PUSH_BUTTON_TAP,
		PUSH_BUTTON_CLICK,
		PUSH_BUTTON_MASTER,
		PUSH_BUTTON_STOP,
		PUSH_BUTTON_LEFT,
		PUSH_BUTTON_RIGHT,
		PUSH_BUTTON_UP,
		PUSH_BUTTON_DOWN,
		PUSH_BUTTON_SELECT,
		PUSH_BUTTON_SHIFT,
		PUSH_BUTTON_NOTE,
		PUSH_BUTTON_SESSION,
		PUSH_BUTTON_ADD_EFFECT,
		PUSH_BUTTON_ADD_TRACK,
		PUSH_BUTTON_OCTAVE_DOWN,
		PUSH_BUTTON_OCTAVE_UP,
		PUSH_BUTTON_REPEAT,
		PUSH_BUTTON_ACCENT,
		PUSH_BUTTON_SCALES,
		PUSH_BUTTON_USER_MODE,
		PUSH_BUTTON_MUTE,
		PUSH_BUTTON_SOLO,
		PUSH_BUTTON_DEVICE_LEFT,
		PUSH_BUTTON_DEVICE_RIGHT,
		PUSH_BUTTON_PLAY,
		PUSH_BUTTON_RECORD,
		PUSH_BUTTON_NEW,
		PUSH_BUTTON_DUPLICATE,
		PUSH_BUTTON_AUTOMATION,
		PUSH_BUTTON_FIXED_LENGTH,
		PUSH_BUTTON_DEVICE,
		PUSH_BUTTON_BROWSE,
		PUSH_BUTTON_TRACK,
		PUSH_BUTTON_CLIP,
		PUSH_BUTTON_VOLUME,
		PUSH_BUTTON_PAN_SEND,
		PUSH_BUTTON_QUANTIZE,
		PUSH_BUTTON_DOUBLE,
		PUSH_BUTTON_DELETE,
		PUSH_BUTTON_UNDO
	];
}

ViewState.prototype.init = function ()
{
	this.addView (VIEW_PLAY, new PlayView (this.model));
	this.addView (VIEW_SESSION, new SessionView (this.model));
	this.addView (VIEW_SEQUENCER, new SequencerView (this.model));
	this.addView (VIEW_DRUM, new DrumView (this.model));
};

ViewState.prototype.getButtons = function () { return this.buttons; };
ViewState.prototype.getButton = function (index) {return this.buttons[index]; };

ViewState.prototype.setActiveView = function (viewId)
{
	this.activeViewId = viewId;

	var view = this.getActiveView ();
	if (view == null)
	{
		this.turnOff ();
		return;
	}

	for (var i = 0; i < this.buttons.length; i++)
		this.push.setButton (this.buttons[i], view.usesButton (this.buttons[i]) ? PUSH_BUTTON_STATE_ON : PUSH_BUTTON_STATE_OFF);

	view.onActivate ();
};

ViewState.prototype.getActiveView = function ()
{
	if (this.activeViewId < 0)
		return null;
	var view = this.views[this.activeViewId];
	return view ? view : null;
};

ViewState.prototype.isActiveView = function (viewId)
{
	return this.activeViewId == viewId;
};

ViewState.prototype.addView = function (viewId, view)
{
	view.attachTo (this.push);
	this.views[viewId] = view;
};

ViewState.prototype.turnOff = function () {
	// Turn off all buttons
	for (var i = 0; i < this.buttons.length; i++)
		this.push.setButton(this.buttons[i], PUSH_BUTTON_STATE_OFF);

	// turn off 1st/2nd row buttons
	for (var i = 20; i < 27; i++)
		this.push.setButton (i, PUSH_BUTTON_STATE_OFF);
	for (var i = 102; i < 110; i++)
		this.push.setButton (i, PUSH_BUTTON_STATE_OFF);
};