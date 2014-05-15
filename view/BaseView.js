// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function BaseView (model)
{
	this.model = model;

	this.canScrollLeft = true;
	this.canScrollRight = true;
	this.canScrollUp = true;
	this.canScrollDown = true;

	this.stopPressed = false;
	
	this.ttLastMillis = -1;
	this.ttLastBPM = -1;
	this.ttHistory = [];
}
BaseView.prototype = new View ();
BaseView.prototype.constructor = BaseView;

BaseView.lastNoteView = VIEW_PLAY;

BaseView.prototype.onActivate = function ()
{
	this.updateNoteMapping ();
	this.updateArrows ();
	setMode (currentMode);
};

BaseView.prototype.updateNoteMapping = function ()
{
	noteInput.setKeyTranslationTable (initArray (-1, 128));
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
		this.push.transport.toggleLoop ();
	else
		this.push.transport.play ();
};

BaseView.prototype.onRecord = function (event)
{
	if (!event.isDown ())
		return;
	if (this.push.isShiftPressed ())
		this.push.transport.toggleClipOverdub ();
	else
		this.push.transport.record ();
};

BaseView.prototype.onStop = function (event)
{
	if (this.push.isShiftPressed ())
	{
		trackBank.getClipLauncherScenes ().stop ();
		return;
	}
	this.stopPressed = event.isDown ();
	this.push.setButton (PUSH_BUTTON_STOP, this.stopPressed ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

BaseView.prototype.onNew = function (event)
{
	if (!event.isDown ())
		return;
	var t = this.model.getSelectedTrack ();
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
				var slots = trackBank.getTrack (t.index).getClipLauncherSlots ();
				slots.createEmptyClip (sIndex, Math.pow (2, currentNewClipLength));
				if (slotIndex != sIndex)
					slots.select (sIndex);
				slots.launch (sIndex);
				this.push.transport.setLauncherOverdub (true);
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
	var selectedTrack = this.model.getSelectedTrack ();
	if (selectedTrack != null)
		this.push.transport.toggleWriteArrangerAutomation ();
};

BaseView.prototype.onFixedLength = function (event)
{
	if (!event.isLong ())
		setMode (event.isDown () ? MODE_FIXED : previousMode);
};

BaseView.prototype.onQuantize = function (event)
{
	if (!event.isDown ())
		return;
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
	this.push.transport.changeTempo (increase);
};

BaseView.prototype.onSmallKnob1Touch = function (isTouched)
{
	this.push.transport.setTempoIndication (isTouched);
};

// Change time (play position)
BaseView.prototype.onSmallKnob2 = function (increase)
{
	this.push.transport.changePosition (increase, this.push.isShiftPressed ());
};

BaseView.prototype.onClick = function (event)
{
	if (event.isDown ())
		this.push.transport.toggleClick ();
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
		this.push.transport.setTempo (bpm);
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
	masterTrack.getVolume ().inc (value <= 61 ? 1 : -1, 128);
};

BaseView.prototype.onValueKnob9Touch = function (isTouched)
{
	if (currentMode != MODE_MASTER)
		masterTrack.getVolume ().setIndication (isTouched);
};

BaseView.prototype.onFirstRow = function (index)
{
	var m = this.push.getActiveMode ();
	if (m != null)
		m.onFirstRow (index);
	
	// TODO (mschmalle) I changed this for the refactor of isFullDisplay()
	// but this logic still feels weird, we should have a ViewMode that
	// determines how views that only need parts of the display can share
	// with other modes that are more primary, the logic below for now
	// just emulates what it was doing originally until we change it
	var fullDisplay = false;
	if (m != null)
		fullDisplay = !m.isFullDisplay(currentMode)

	if (fullDisplay)
	{
		if (this.stopPressed)
			trackBank.getTrack (index).stop ();
		else
			trackBank.getTrack (index).select ();
	}
};

// Rec arm / enable monitor buttons
BaseView.prototype.onSecondRow = function (index)
{
	var m = this.push.getActiveMode ();
	if (m != null)
		m.onSecondRow (index);
	
	// TODO (mschmalle) Can we do this better now that we have more abstraction with modes?
	// TODO MODE_DEVICE
	if (currentMode != MODE_DEVICE && currentMode != MODE_MASTER && currentMode != MODE_SCALES && currentMode != MODE_PRESET)
	{
		var t = trackBank.getTrack (index);
		if (this.push.isShiftPressed ())
			; // Toggle monitor: Currently not possible
		else
			t.getArm ().set (toggleValue (this.model.getTrack (index).recarm));
	} 
};

BaseView.prototype.onMaster = function (event)
{
	switch (event.getState ())
	{
		case ButtonEvent.UP:
			if (currentMode == MODE_FRAME)
				setMode (previousMode);
			break;
		case ButtonEvent.DOWN:
			if (this.push.isActiveMode (MODE_MASTER))
				this.push.showVU = !this.push.showVU;
			else
			{
				setMode (MODE_MASTER);
				masterTrack.select ();
			}
			break;
		case ButtonEvent.LONG:
			// Toggle back since it was toggled on DOWN
			this.push.showVU = !this.push.showVU;
			setMode (MODE_FRAME);
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
		setMode (MODE_VOLUME);
};

BaseView.prototype.onPanAndSend = function (event)
{
	if (!event.isDown ())
		return;
	var mode = currentMode + 1;
	if (mode < MODE_PAN || mode > MODE_SEND6)
		mode = MODE_PAN;
	setMode (mode);
};

BaseView.prototype.onTrack = function (event)
{
	if (!event.isDown ())
		return;
	if (this.push.isActiveMode (MODE_TRACK))
		this.push.showVU = !this.push.showVU;
	else
		setMode (MODE_TRACK);
};

BaseView.prototype.onDevice = function (event)
{
	switch (event.getState ())
	{
		case ButtonEvent.LONG:
			setMode (MODE_PARAM_PAGE);
			break;
		case ButtonEvent.UP:
			setMode (this.push.getMode (MODE_PARAM_PAGE).getCurrentMode ());
			break;
	}
//	if (!event.isDown ())
//		return;
//	if (currentMode == MODE_DEVICE)
//		setMode (MODE_MACRO);
//	else if (currentMode == MODE_MACRO)
//		setMode (MODE_USERCONTROLS);
//	else
//		setMode (MODE_DEVICE);
};

BaseView.prototype.onBrowse = function (event)
{
	if (!event.isDown ())
		return;
	// TODO MODE_DEVICE
	if (currentMode == MODE_DEVICE)
		setMode(MODE_PRESET);
	else
		this.model.getApplication ().toggleBrowserVisibility (); // Track
};

// Dec Track or Device Parameter Bank
BaseView.prototype.onDeviceLeft = function (event)
{
	if (!event.isDown ())
		return;
	// TODO MODE_DEVICE
//	if (currentMode == MODE_DEVICE)
//	{
//		device.previousParameterPage ();
//		return;
//	}
	if (canScrollTrackUp)
	{
		trackBank.scrollTracksPageUp ();
		host.scheduleTask (selectTrack, [7], 100);
	}
};

// Inc Track or Device Parameter Bank
BaseView.prototype.onDeviceRight = function (event)
{
	if (!event.isDown ())
		return;
	// TODO MODE_DEVICE
//	if (currentMode == MODE_DEVICE)
//	{
//		device.nextParameterPage ();
//		return;
//	}
	if (canScrollTrackDown)
	{
		trackBank.scrollTracksPageDown ();
		host.scheduleTask (selectTrack, [0], 100);
	}
};

BaseView.prototype.onMute = function (event)
{
	if (!event.isDown ())
		return;
	var selectedTrack = this.model.getSelectedTrack ();
	if (selectedTrack == null)
		return;
	selectedTrack.mute = toggleValue (selectedTrack.mute);
	trackBank.getTrack (selectedTrack.index).getMute ().set (selectedTrack.mute);
	this.push.setButton (PUSH_BUTTON_MUTE, selectedTrack.mute ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

BaseView.prototype.onSolo = function (event)
{
	if (!event.isDown ())
		return;
	var selectedTrack = this.model.getSelectedTrack ();
	if (selectedTrack == null)
		return;
	selectedTrack.solo = toggleValue (selectedTrack.solo);
	trackBank.getTrack (selectedTrack.index).getSolo ().set (selectedTrack.solo);
	this.push.setButton (PUSH_BUTTON_SOLO, selectedTrack.solo ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

BaseView.prototype.onScales = function (event)
{
	switch (event.getState ())
	{
		case ButtonEvent.DOWN:
			this.quitScalesMode = false;
			setMode (currentMode == MODE_SCALES ? previousMode : MODE_SCALES);
			break;
		case ButtonEvent.LONG:
			this.quitScalesMode = true;
			break;
		case ButtonEvent.UP:
			if (this.quitScalesMode)
				setMode (previousMode);
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
	if (!event.isDown ())
		return;
	Config.accentActive = !Config.accentActive;
	this.push.setButton (PUSH_BUTTON_ACCENT, Config.accentActive ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

BaseView.prototype.onShift = function (event)
{
	this.push.setButton (PUSH_BUTTON_SHIFT, event.isUp () ? PUSH_BUTTON_STATE_ON : PUSH_BUTTON_STATE_HI);
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

function selectTrack (index)
{
	var t = trackBank.getTrack (index);
	if (t != null)
		t.select ();
}