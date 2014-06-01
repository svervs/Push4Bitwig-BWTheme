// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function BaseView (model)
{
	this.model = model;

	this.canScrollLeft  = true;
	this.canScrollRight = true;
	this.canScrollUp    = true;
	this.canScrollDown  = true;

	this.restartFlag   = false;
	this.stopPressed   = false;
	
	this.ttLastMillis = -1;
	this.ttLastBPM    = -1;
	this.ttHistory    = [];
}
BaseView.prototype = new View ();
BaseView.prototype.constructor = BaseView;

BaseView.lastNoteView = VIEW_PLAY;

BaseView.prototype.onActivate = function ()
{
	this.updateNoteMapping ();
	this.updateArrows ();
	this.push.setPendingMode (this.push.getCurrentMode ());
};

BaseView.prototype.updateNoteMapping = function ()
{
	this.push.setKeyTranslationTable (initArray (-1, 128));
};

BaseView.prototype.updateArrows = function ()
{
	this.push.setButton (PUSH_BUTTON_LEFT, this.canScrollLeft ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
	this.push.setButton (PUSH_BUTTON_RIGHT, this.canScrollRight ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
	this.push.setButton (PUSH_BUTTON_UP, this.canScrollUp ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
	this.push.setButton (PUSH_BUTTON_DOWN, this.canScrollDown ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
};

BaseView.prototype.onPlay = function (event)
{
	if (!event.isDown ())
		return;
	if (this.push.isShiftPressed ())
		this.model.getTransport ().toggleLoop ();
	else
	{
		if (!this.restartFlag)
		{
			this.model.getTransport ().play ();
			this.doubleClickTest ();
		}
		else
		{
			this.model.getTransport ().rewindAndPlay ();
			this.restartFlag = false;
		}
	}
};

BaseView.prototype.doubleClickTest = function ()
{
	this.restartFlag = true;
	host.scheduleTask (doObject (this, function ()
	{
		this.restartFlag = false;
	}), null, 250);
};

BaseView.prototype.onRecord = function (event)
{
	if (!event.isDown ())
		return;
	if (this.push.isShiftPressed ())
		this.model.getTransport ().toggleClipOverdub ();
	else
		this.model.getTransport ().record ();
};

BaseView.prototype.onStop = function (event)
{
	if (this.push.isShiftPressed ())
	{
		this.model.getTrackBank ().getClipLauncherScenes ().stop ();
		return;
	}
	this.stopPressed = event.isDown ();
	this.push.setButton (PUSH_BUTTON_STOP, this.stopPressed ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

BaseView.prototype.onNew = function (event)
{
	if (!event.isDown ())
		return;
	var tb = this.model.getTrackBank ();
	var t = tb.getSelectedTrack ();
	if (t != null)
	{
		var slotIndex = this.getSelectedSlot (t);
		if (slotIndex == -1)
			slotIndex = 0;
			
		for (var i = 0; i < 8; i++)
		{
			var sIndex = (slotIndex + i) % 8;
			var s = t.slots[sIndex];
			if (!s.hasContent)
			{
				var slots = tb.getClipLauncherSlots (t.index);
				slots.createEmptyClip (sIndex, Math.pow (2, tb.getNewClipLength ()));
				if (slotIndex != sIndex)
					slots.select (sIndex);
				slots.launch (sIndex);
				this.model.getTransport ().setLauncherOverdub (true);
				return;
			}
		}
	}
	host.showPopupNotification ("In the current selected grid view there is no empty slot. Please scroll down.");
};

BaseView.prototype.onDuplicate = function (event)
{
	if (!event.isDown ())
		return;
	host.showPopupNotification ("Duplicate: Function not supported (yet).");
};

BaseView.prototype.onAutomation = function (event)
{
	if (!event.isDown ())
		return;
	var selectedTrack = this.model.getTrackBank ().getSelectedTrack ();
	if (selectedTrack != null)
		this.model.getTransport ().toggleWriteArrangerAutomation ();
};

BaseView.prototype.onFixedLength = function (event)
{
	if (!event.isLong ())
		this.push.setPendingMode (event.isDown () ? MODE_FIXED : this.push.getPreviousMode ());
};

BaseView.prototype.onQuantize = function (event)
{
	if (!event.isDown ())
		return;

	if (this.push.isShiftPressed ())
		this.push.setPendingMode (MODE_GROOVE);
	else
		host.showPopupNotification ("Quantize: Function not supported (yet).");
};

BaseView.prototype.onDouble = function (event)
{
	if (event.isDown ())
		this.model.getApplication ().duplicate ();
};

BaseView.prototype.onDelete = function (event)
{
	if (!event.isDown ())
		return;
	// Weird workaround as 'delete' is a reserved word in JS
	var app = this.model.getApplication ();
	var deleteFunction = app['delete'];
	deleteFunction.call (app);
};

BaseView.prototype.onUndo = function (event)
{
	if (!event.isDown ())
		return;
	if (this.push.isShiftPressed ())
		this.model.getApplication ().redo ();
	else
		this.model.getApplication ().undo ();
};

// Set tempo
BaseView.prototype.onSmallKnob1 = function (increase)
{
	this.model.getTransport( ).changeTempo (increase);
};

BaseView.prototype.onSmallKnob1Touch = function (isTouched)
{
	this.model.getTransport ().setTempoIndication (isTouched);
};

// Change time (play position)
BaseView.prototype.onSmallKnob2 = function (increase)
{
	this.model.getTransport ().changePosition (increase, this.push.isShiftPressed ());
};

BaseView.prototype.onClick = function (event)
{
	if (event.isDown ())
		this.model.getTransport ().toggleClick ();
};

BaseView.prototype.onTapTempo = function (event)
{
	if (!event.isDown ())
		return;

	var millis = new Date ().getTime ();
	
	// First press?
	if (this.ttLastMillis == -1)
	{
		this.ttLastMillis = millis;
		return;
	}	
	
	// Calc the difference
	var diff = millis - this.ttLastMillis;
	this.ttLastMillis = millis;
	
	// Store up to 8 differences for average calculation
	this.ttHistory.push (diff);
	if (this.ttHistory.length > 8)
		this.ttHistory.shift ();

	// Calculate the new average difference
	var sum = 0;
	for (var i = 0; i < this.ttHistory.length; i++)
		sum += this.ttHistory[i];
	var average = sum / this.ttHistory.length;
	var bpm = 60000 / average;
	
	// If the deviation is greater 20bpm, reset history
	if (this.ttLastBPM != -1 && Math.abs (this.ttLastBPM - bpm) > 20)
	{
		this.ttHistory.length = 0;
		this.ttLastBPM = -1;
	}
	else
	{
		this.ttLastBPM = bpm;
		this.model.getTransport ().setTempo (bpm);
	}
};

BaseView.prototype.onValueKnob = function (index, value)
{
	var m = this.push.getActiveMode ();
	if (m != null)
		m.onValueKnob (index, value);
};

// Master Volume
BaseView.prototype.onValueKnob9 = function (value)
{
	this.model.getMasterTrack ().incVolume (value);
};

BaseView.prototype.onValueKnob9Touch = function (isTouched)
{
	if (isTouched && this.push.getCurrentMode () == MODE_MASTER)
        return;
    this.push.setPendingMode (isTouched ? MODE_MASTER : this.push.getPreviousMode ());
};

BaseView.prototype.onFirstRow = function (index)
{
	var m = this.push.getActiveMode ();
	if (m != null)
		m.onFirstRow (index);
};

// Rec arm / enable monitor buttons
BaseView.prototype.onSecondRow = function (index)
{
	var m = this.push.getActiveMode ();
	if (m != null)
		m.onSecondRow (index);
};

BaseView.prototype.onMaster = function (event)
{
	switch (event.getState ())
	{
		case ButtonEvent.UP:
			if (this.push.getCurrentMode () == MODE_FRAME)
				this.push.setPendingMode (this.push.getPreviousMode ());
			break;
		case ButtonEvent.DOWN:
			if (this.push.isActiveMode (MODE_MASTER))
				this.push.showVU = !this.push.showVU;
			else
			{
				this.push.setPendingMode (MODE_MASTER);
				this.model.getMasterTrack ().select ();
			}
			break;
		case ButtonEvent.LONG:
			// Toggle back since it was toggled on DOWN
			this.push.showVU = !this.push.showVU;
			this.push.setPendingMode (MODE_FRAME);
			break;
	}
};

BaseView.prototype.onVolume = function (event)
{
	if (!event.isDown ())
		return;
	if (this.push.isActiveMode (MODE_VOLUME))
		this.push.showVU = !this.push.showVU;
	else
		this.push.setPendingMode (MODE_VOLUME);
};

BaseView.prototype.onPanAndSend = function (event)
{
	if (!event.isDown ())
		return;
	var mode = this.push.getCurrentMode () + 1;
	if (mode < MODE_PAN || mode > MODE_SEND6)
		mode = MODE_PAN;
	this.push.setPendingMode (mode);
};

BaseView.prototype.onTrack = function (event)
{
	if (!event.isDown ())
		return;
	if (this.push.isActiveMode (MODE_TRACK))
		this.push.showVU = !this.push.showVU;
	else
		this.push.setPendingMode (MODE_TRACK);
};

BaseView.prototype.onDevice = function (event)
{
	if (!event.isDown ())
		return;
	var selectMode = this.push.getMode (MODE_PARAM_PAGE_SELECT);
	var cm = this.push.getCurrentMode ();
	if (cm == MODE_PARAM_PAGE_SELECT || !selectMode.isPageMode (cm))
		this.push.setPendingMode (selectMode.getCurrentMode ());
	else
		this.push.setPendingMode (MODE_PARAM_PAGE_SELECT);
};

BaseView.prototype.onBrowse = function (event)
{
	if (!event.isDown ())
		return;

	if (this.push.getCurrentMode () == MODE_BANK_DEVICE)
		this.push.setPendingMode (MODE_PRESET);
	else
		this.model.getApplication ().toggleBrowserVisibility (); // Track
};

// Dec Track or Device Parameter Bank
BaseView.prototype.onDeviceLeft = function (event)
{
	if (!event.isDown ())
		return;

	if (this.model.getTrackBank ().canScrollTrackUp ())
	{
		this.model.getTrackBank ().scrollTracksPageUp ();
		host.scheduleTask (doObject (this, this.selectTrack), [7], 100);
	}
};

// Inc Track or Device Parameter Bank
BaseView.prototype.onDeviceRight = function (event)
{
	if (!event.isDown ())
		return;

	if (this.model.getTrackBank ().canScrollTrackDown ())
	{
		this.model.getTrackBank ().scrollTracksPageDown ();
		host.scheduleTask (doObject (this, this.selectTrack), [0], 100);
	}
};

BaseView.prototype.onMute = function (event)
{
	if (!event.isDown ())
		return;
	var selectedTrack = this.model.getTrackBank ().getSelectedTrack ();
	if (selectedTrack == null)
		return;
	this.model.getTrackBank ().toggleMute (selectedTrack.index);
	this.push.setButton (PUSH_BUTTON_MUTE, selectedTrack.mute ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

BaseView.prototype.onSolo = function (event)
{
	if (!event.isDown ())
		return;
	var selectedTrack = this.model.getTrackBank ().getSelectedTrack ();
	if (selectedTrack == null)
		return;
	this.model.getTrackBank ().toggleSolo (selectedTrack.index);
	this.push.setButton (PUSH_BUTTON_SOLO, selectedTrack.solo ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

BaseView.prototype.onScales = function (event)
{
	switch (event.getState ())
	{
		case ButtonEvent.DOWN:
			this.quitScalesMode = false;
			this.push.setPendingMode (this.push.getCurrentMode () == MODE_SCALES ? this.push.getPreviousMode () : MODE_SCALES);
			break;
		case ButtonEvent.LONG:
			this.quitScalesMode = true;
			break;
		case ButtonEvent.UP:
			if (this.quitScalesMode)
				this.push.setPendingMode (this.push.getPreviousMode ());
			break;
	}
};

BaseView.prototype.onAddFX = function (event)
{
	if (!event.isDown ())
		return;
	host.showPopupNotification ("Add Effect: Function not supported (yet).");
};

BaseView.prototype.onAddTrack = function (event)
{
	if (!event.isDown ())
		return;
	host.showPopupNotification ("Add Track: Function not supported (yet).");
};

BaseView.prototype.onNote = function (event)
{
	if (!event.isDown ())
		return;
	BaseView.lastNoteView = this.push.isActiveView (VIEW_SESSION) ? BaseView.lastNoteView :
								(this.push.isShiftPressed () ? VIEW_DRUM : (this.push.isActiveView (VIEW_PLAY) ? VIEW_SEQUENCER : VIEW_PLAY));
	this.push.setActiveView (BaseView.lastNoteView);
};

BaseView.prototype.onSession = function (event)
{
	if (!event.isDown ())
		return;
	if (this.push.isActiveView (VIEW_SESSION))
		return;
	BaseView.lastNoteView = this.push.isActiveView (VIEW_PLAY) ? VIEW_PLAY : (this.push.isActiveView (VIEW_DRUM) ? VIEW_DRUM : VIEW_SEQUENCER);
	this.push.setActiveView (VIEW_SESSION);
};

BaseView.prototype.onAccent = function (event)
{
	switch (event.getState ())
	{
		case ButtonEvent.DOWN:
			this.quitAccentMode = false;
			break;
		case ButtonEvent.LONG:
			this.quitAccentMode = true;
			this.push.setPendingMode (MODE_ACCENT);
			break;
		case ButtonEvent.UP:
			if (this.quitAccentMode)
				this.push.setPendingMode (this.push.getPreviousMode ());
			else
			{
				Config.accentActive = !Config.accentActive;
				this.push.setButton (PUSH_BUTTON_ACCENT, Config.accentActive ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
			}
			break;
	}
};

BaseView.prototype.onShift = function (event)
{
	this.push.setButton (PUSH_BUTTON_SHIFT, event.isUp () ? PUSH_BUTTON_STATE_ON : PUSH_BUTTON_STATE_HI);
	
	var cm = this.push.getCurrentMode ();
	if (event.isDown () && cm == MODE_SCALES)
		this.push.setPendingMode (MODE_SCALE_LAYOUT);
	else if (event.isUp () && cm == MODE_SCALE_LAYOUT)
		this.push.setPendingMode (MODE_SCALES);
};

BaseView.prototype.onFootswitch2 = function (value)
{
	this.onNew (new ButtonEvent (value == 127 ? ButtonEvent.DOWN : ButtonEvent.UP));
};

BaseView.prototype.getSelectedSlot = function (track)
{
	for (var i = 0; i < track.slots.length; i++)
		if (track.slots[i].isSelected)
			return i;
	return -1;
};

BaseView.prototype.turnOffBlink = function ()
{
	for (var i = 36; i < 100; i++)
		this.push.pads.blink (i, PUSH_COLOR_BLACK);
};

BaseView.prototype.selectTrack = function (index)
{
	this.model.getTrackBank ().selectTrack (index);
}