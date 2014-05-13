// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function SessionView (model)
{
	BaseView.call (this, model);
	
	this.canScrollLeft = true;
	this.canScrollRight = true;
	this.canScrollUp = true;
	this.canScrollDown = true;
	this.flip = false;
	
	trackBank.addCanScrollScenesDownObserver (doObject (this, function (canScroll)
	{
		if (this.flip)
			this.canScrollLeft = canScroll;
		else
			this.canScrollUp = canScroll;
		if (this.push.isActiveView (VIEW_SESSION))
			this.updateArrows ();
	}));
	trackBank.addCanScrollScenesUpObserver (doObject (this, function (canScroll)
	{
		if (this.flip)
			this.canScrollRight = canScroll;
		else
			this.canScrollDown = canScroll;
		if (this.push.isActiveView (VIEW_SESSION))
			this.updateArrows ();
	}));
	trackBank.addCanScrollTracksDownObserver (doObject (this, function (canScroll)
	{
		if (this.flip)
			this.canScrollDown = canScroll;
		else
			this.canScrollRight = canScroll;
		if (this.push.isActiveView (VIEW_SESSION))
			this.updateArrows ();
	}));
	trackBank.addCanScrollTracksUpObserver (doObject (this, function (canScroll)
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

SessionView.prototype.onFirstRow = function (index)
{
	if (this.push.isShiftPressed())
		trackBank.getTrack(index).returnToArrangement();
	else
		BaseView.prototype.onFirstRow.call (this, index);
};

SessionView.prototype.onActivate = function ()
{
	BaseView.prototype.onActivate.call (this);

	this.push.setButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_HI);
	for (var i = 0; i < 8; i++)
		trackBank.getTrack (i).getClipLauncherSlots ().setIndication (true);
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
	
	var slot = this.model.getTrack (t).slots[s];
	var slots = trackBank.getTrack (t).getClipLauncherSlots ();
	
	if (!this.push.isSelectPressed ())
	{
		if (this.model.getTrack (t).recarm)
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
	var t = this.model.getSelectedTrack ();
	if (t == null)
		return;
	var slot = this.getSelectedSlot (t);
	if (slot != -1)
		trackBank.getTrack (t.index).getClipLauncherSlots ().showInEditor (slot);
};

SessionView.prototype.onLeft = function (event)
{
	if (!event.isDown ())
		return;

	if (this.flip)
	{
		if (this.push.isShiftPressed ())
			trackBank.scrollScenesPageUp ();
		else
			trackBank.scrollScenesUp ();
	}
	else
	{
		if (this.push.isShiftPressed ())
			trackBank.scrollTracksPageUp ();
		else
			trackBank.scrollTracksUp ();
	}
};

SessionView.prototype.onRight = function (event)
{
	if (!event.isDown ())
		return;
		
	if (this.flip)
	{
		if (this.push.isShiftPressed ())
			trackBank.scrollScenesPageDown ();
		else
			trackBank.scrollScenesDown ();
	}
	else
	{
		if (this.push.isShiftPressed ())
			trackBank.scrollTracksPageDown ();
		else
			trackBank.scrollTracksDown ();
	}
};

SessionView.prototype.onUp = function (event)
{
	if (!event.isDown ())
		return;
		
	if (this.flip)
	{
		if (this.push.isShiftPressed ())
			trackBank.scrollTracksPageUp ();
		else
			trackBank.scrollTracksUp ();
	}
	else
	{
		if (this.push.isShiftPressed ())
			trackBank.scrollScenesPageUp ();
		else
			trackBank.scrollScenesUp ();
	}
};

SessionView.prototype.onDown = function (event)
{
	if (!event.isDown ())
		return;
		
	if (this.flip)
	{
		if (this.push.isShiftPressed ())
			trackBank.scrollTracksPageDown ();
		else
			trackBank.scrollTracksDown ();
	}
	else
	{
		if (this.push.isShiftPressed ())
			trackBank.scrollScenesPageDown ();
		else
			trackBank.scrollScenesDown ();
	}
};

SessionView.prototype.onScene = function (scene)
{
	trackBank.launchScene (scene);
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
	for (var x = 0; x < 8; x++)
	{
		var t = this.model.getTrack (x);
		for (var y = 0; y < 8; y++)
			this.drawPad (t.slots[y], this.flip ? y : x, this.flip ? x : y, t.recarm);
	}
};

SessionView.prototype.drawPad = function (slot, x, y, isArmed)
{
	var color = slot.isRecording ? PUSH_COLOR_RED_HI : 
					(slot.hasContent ? 
						(slot.color ? slot.color : PUSH_COLOR_ORANGE_HI) : 
						(isArmed ? PUSH_COLOR_RED_LO : PUSH_COLOR_BLACK));
	var n = 92 + x - 8 * y;
	this.push.pads.light (n, color);
	this.push.pads.blink (n, (slot.isQueued || slot.isPlaying) ? (slot.isRecording ? PUSH_COLOR_RED_HI : PUSH_COLOR_GREEN_HI) : PUSH_COLOR_BLACK, slot.isQueued);
};
