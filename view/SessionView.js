// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function SessionView (model)
{
	BaseView.call (this, model);

	// TODO eventually move this data to TrackBankProxy
	this.canScrollLeft = true;
	this.canScrollRight = true;
	this.canScrollUp = true;
	this.canScrollDown = true;
	this.flip = false;

	this.sessionLayout = new SessionLayout (this);
	this.arrangementLayout = new ArrangementLayout (this);

	// TODO (mschmalle) These observers belong in TrackBankProxy
	// where this view uses the model data from the proxy
	var tb = this.model.getTrackBank ().trackBank;
	tb.addCanScrollScenesDownObserver (doObject (this, function (canScroll)
	{
		if (this.flip)
			this.canScrollLeft = canScroll;
		else
			this.canScrollUp = canScroll;
		if (this.push.isActiveView (VIEW_SESSION))
			this.updateArrows ();
	}));
	tb.addCanScrollScenesUpObserver (doObject (this, function (canScroll)
	{
		if (this.flip)
			this.canScrollRight = canScroll;
		else
			this.canScrollDown = canScroll;
		if (this.push.isActiveView (VIEW_SESSION))
			this.updateArrows ();
	}));
	tb.addCanScrollTracksDownObserver (doObject (this, function (canScroll)
	{
		if (this.flip)
			this.canScrollDown = canScroll;
		else
			this.canScrollRight = canScroll;
		if (this.push.isActiveView (VIEW_SESSION))
			this.updateArrows ();
	}));
	tb.addCanScrollTracksUpObserver (doObject (this, function (canScroll)
	{
		if (this.flip)
			this.canScrollUp = canScroll;
		else
			this.canScrollLeft = canScroll;
		if (this.push.isActiveView (VIEW_SESSION))
			this.updateArrows ();
	}));
}
SessionView.prototype = new BaseView ();

SessionView.prototype.getLayout = function ()
{
	return this.flip ? this.arrangementLayout :  this.sessionLayout;
}

SessionView.prototype.onFirstRow = function (index)
{
	if (this.push.isShiftPressed ())
		this.model.getTrackBank ().returnToArrangement (index);
	else
		BaseView.prototype.onFirstRow.call (this, index);
};

SessionView.prototype.onActivate = function ()
{
	BaseView.prototype.onActivate.call (this);

	this.push.setButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_HI);
	for (var i = 0; i < 8; i++)
		this.model.getTrackBank ().getClipLauncherSlots (i).setIndication (true);

	for (var i = PUSH_BUTTON_SCENE1; i <= PUSH_BUTTON_SCENE8; i++)
		this.push.setButton (i, PUSH_COLOR_SCENE_GREEN);
};

SessionView.prototype.usesButton = function (buttonID)
{
	switch (buttonID)
	{
		case PUSH_BUTTON_OCTAVE_DOWN:
		case PUSH_BUTTON_OCTAVE_UP:
		case PUSH_BUTTON_ADD_EFFECT:
		case PUSH_BUTTON_ADD_TRACK:
		case PUSH_BUTTON_REPEAT:
		case PUSH_BUTTON_ACCENT:
		case PUSH_BUTTON_USER_MODE:
		case PUSH_BUTTON_DUPLICATE:
			return false;
	}
	return true;
};

SessionView.prototype.onGrid = function (note, velocity)
{
	if (velocity == 0)
		return;

	var index = note - 36;
	var t = index % 8;
	var s = 7 - Math.floor (index / 8);
	
	var slot = this.model.getTrackBank ().getTrack (index).slots[s];
	var slots = this.model.getTrackBank ().getClipLauncherSlots (t);
	
	if (!this.push.isSelectPressed ())
	{
		if (this.model.getTrackBank ().getTrack (t).recarm)
		{
			if (slot.isRecording)
				slots.launch (s);
			else
				slots.record (s);
		}
		else
			slots.launch (s);
	}
 	slots.select (s);
};

SessionView.prototype.onClip = function (event)
{
	if (!event.isDown ())
		return;
	var t = this.model.getTrackBank ().getSelectedTrack ();
	if (t == null)
		return;
	var slot = this.getSelectedSlot (t);
	if (slot != -1)
		this.model.getTrackBank ().getClipLauncherSlots (t.index).showInEditor (slot);
};

SessionView.prototype.onLeft = function (event)
{
	this.getLayout ().onLeft (event);
};

SessionView.prototype.onRight = function (event)
{
	this.getLayout ().onRight (event);
};

SessionView.prototype.onUp = function (event)
{
	this.getLayout ().onUp (event);
};

SessionView.prototype.onDown = function (event)
{
	this.getLayout ().onDown (event);
};

SessionView.prototype.onScene = function (scene)
{
	this.getLayout ().onScene (scene);
};

SessionView.prototype.onAccent = function (event)
{
	// No accent button usage in the Session view
};

SessionView.prototype.onSession = function (event)
{
	if (!event.isDown ())
		return;
		
	this.flip = !this.flip;
	var dUp   = this.canScrollUp;
	var dDown = this.canScrollDown;
	this.canScrollUp = this.canScrollLeft;
	this.canScrollDown = this.canScrollRight;
	this.canScrollLeft = dUp;
	this.canScrollRight = dDown;
	this.updateArrows ();
};

SessionView.prototype.drawGrid = function ()
{
	this.getLayout ().drawGrid ();
};

// TODO (mschmalle) Refactoring for Issue#67, will leave for now
// This is currently not possible due to the fact the first row button
// logic is tied into Modes. So switching rec arm to scene buttons isn't
// straight forward

function BaseSessionLayout (view)
{
	if (view == null)
		return; // FIX this
	this.view = view;
	this.model = view.model;
}

BaseSessionLayout.prototype.onLeft = function (event) {};
BaseSessionLayout.prototype.onRight = function (event) {};
BaseSessionLayout.prototype.onUp = function (event) {};
BaseSessionLayout.prototype.onDown = function (event) {};
BaseSessionLayout.prototype.onScene = function (scene) {};
BaseSessionLayout.prototype.drawGrid = function () {};

BaseSessionLayout.prototype.drawPad = function (slot, x, y, isArmed)
{
	var color = slot.isRecording ? PUSH_COLOR_RED_HI :
		(slot.hasContent ?
			(slot.color ? slot.color : PUSH_COLOR_ORANGE_HI) :
			(isArmed ? PUSH_COLOR_RED_LO : PUSH_COLOR_BLACK));
	var n = 92 + x - 8 * y;
	this.view.push.pads.light (n, color);
	this.view.push.pads.blink (n, (slot.isQueued || slot.isPlaying) ? (slot.isRecording ? PUSH_COLOR_RED_HI : PUSH_COLOR_GREEN_HI) : PUSH_COLOR_BLACK, slot.isQueued);
};

function SessionLayout (view)
{
	BaseSessionLayout.call (this, view);
}
SessionLayout.prototype = new BaseSessionLayout ();

SessionLayout.prototype.onLeft = function (event)
{
	if (!event.isDown ())
		return;

	if (this.view.push.isShiftPressed ())
		this.model.getTrackBank ().scrollTracksPageUp ();
	else
		this.model.getTrackBank ().scrollTracksUp ();
};

SessionLayout.prototype.onRight = function (event)
{
	if (!event.isDown ())
		return;

	if (this.view.push.isShiftPressed ())
		this.model.getTrackBank ().scrollTracksPageDown ();
	else
		this.model.getTrackBank ().scrollTracksDown ();
};

SessionLayout.prototype.onUp = function (event)
{
	if (!event.isDown ())
		return;

	if (this.view.push.isShiftPressed ())
		this.model.getTrackBank ().scrollScenesPageUp ();
	else
		this.model.getTrackBank ().scrollScenesUp ();
};

SessionLayout.prototype.onDown = function (event)
{
	if (!event.isDown ())
		return;

	if (this.view.push.isShiftPressed ())
		this.model.getTrackBank ().scrollScenesPageDown ();
	else
		this.model.getTrackBank ().scrollScenesDown ();
};

SessionLayout.prototype.onScene = function (scene)
{
	this.model.getTrackBank ().launchScene (scene);
};

SessionLayout.prototype.drawGrid = function ()
{
	for (var x = 0; x < 8; x++)
	{
		var t = this.model.getTrackBank ().getTrack (x);
		for (var y = 0; y < 8; y++)
			this.drawPad (t.slots[y], x, y, t.recarm);
	}
};

function ArrangementLayout (view)
{
	BaseSessionLayout.call (this, view);
}
ArrangementLayout.prototype = new BaseSessionLayout ();

ArrangementLayout.prototype.onLeft = function (event)
{
	if (!event.isDown ())
		return;

	if (this.view.push.isShiftPressed ())
		this.model.getTrackBank ().scrollScenesPageUp ();
	else
		this.model.getTrackBank ().scrollScenesUp ();
};

ArrangementLayout.prototype.onRight = function (event)
{
	if (!event.isDown ())
		return;

	if (this.view.push.isShiftPressed ())
		this.model.getTrackBank ().scrollScenesPageDown ();
	else
		this.model.getTrackBank ().scrollScenesDown ();
};

ArrangementLayout.prototype.onUp = function (event)
{
	if (!event.isDown ())
		return;

	if (this.view.push.isShiftPressed ())
		this.model.getTrackBank ().scrollTracksPageUp ();
	else
		this.model.getTrackBank ().scrollTracksUp ();
};

ArrangementLayout.prototype.onDown = function (event)
{
	if (!event.isDown ())
		return;

	if (this.view.push.isShiftPressed ())
		this.model.getTrackBank ().scrollTracksPageDown ();
	else
		this.model.getTrackBank ().scrollTracksDown ();
};

ArrangementLayout.prototype.onScene = function (scene)
{
	this.model.getTrackBank ().launchScene (scene);
};

ArrangementLayout.prototype.drawGrid = function ()
{
	for (var x = 0; x < 8; x++)
	{
		var t = this.model.getTrackBank ().getTrack (x);
		for (var y = 0; y < 8; y++)
			this.drawPad (t.slots[y], y, x, t.recarm);
	}
};
