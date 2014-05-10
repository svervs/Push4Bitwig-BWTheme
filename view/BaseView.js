// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function BaseView ()
{
	this.canScrollLeft = true;
	this.canScrollRight = true;
	this.canScrollUp = true;
	this.canScrollDown = true;

	this.stopPressed = false;
	this.newPressed = false;
	
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
		transport.toggleLoop ();
	else
		transport.play ();
};

BaseView.prototype.onRecord = function (event)
{
	if (!event.isDown ())
		return;
	if (this.push.isShiftPressed ())
		transport.toggleLauncherOverdub ();
	else
		transport.record ();
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

BaseView.prototype.onDuplicate = function (event)
{
	if (!event.isDown ())
		return;
	// TODO Not possible?
	host.showPopupNotification ("Duplicate: Function not supported (yet).");
};

BaseView.prototype.onAutomation = function (event)
{
	if (!event.isDown ())
		return;
	var selectedTrack = getSelectedTrack ();
	if (selectedTrack != null)
		transport.toggleWriteArrangerAutomation ();
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
	// TODO Not possible?
	host.showPopupNotification ("Quantize: Function not supported (yet).");
};

BaseView.prototype.onDouble = function (event)
{
	if (event.isDown ())
		application.duplicate ();
};

BaseView.prototype.onDelete = function (event)
{
	if (!event.isDown ())
		return;
	// Weird workaround as 'delete' is a reserved word in JS
	var deleteFunction = application['delete'];
	deleteFunction.call (application);
};

BaseView.prototype.onUndo = function (event)
{
	if (!event.isDown ())
		return;
	if (this.push.isShiftPressed ())
		application.redo ();
	else
		application.undo ();
};

// Set tempo
BaseView.prototype.onSmallKnob1 = function (increase)
{
	tempo = increase ? Math.min (tempo + 1, TEMPO_RESOLUTION) : Math.max (0, tempo - 1);
	transport.getTempo ().set (tempo, TEMPO_RESOLUTION);
};

BaseView.prototype.onSmallKnob1Touch = function (isTouched)
{
	transport.getTempo ().setIndication (isTouched);
};

// Change time (play position)
BaseView.prototype.onSmallKnob2 = function (increase)
{
	var frac = this.push.isShiftPressed () ? INC_FRACTION_TIME_SLOW : INC_FRACTION_TIME;
	transport.incPosition (delta = increase ? frac : -frac, false);			
};

BaseView.prototype.onClick = function (event)
{
	if (event.isDown ())
		transport.toggleClick ();
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
		// Rescale to Bitwig
		var scaled = (bpm - 20) / 646 * TEMPO_RESOLUTION;
		transport.getTempo ().set (Math.min (Math.max (0, scaled), TEMPO_RESOLUTION), TEMPO_RESOLUTION);
	}
};

BaseView.prototype.onValueKnob = function (index, value)
{
	var m = this.push.getActiveMode ();
	if (m != null)
		m.onValueKnob (index, value);
};

BaseView.prototype.onValueKnobTouch = function (index, isTouched)
{
	var m = this.push.getActiveMode ();
	if (m != null)
		m.onValueKnobTouch (index, isTouched);
	
	// See https://github.com/git-moss/Push4Bitwig/issues/32
	// We keep the code if an additional focus becomes available
	/*
	switch (currentMode)
	{
		case MODE_MASTER:
			if (index == 0)
			{
				// Volume
				masterTrack.getVolume ().setIndication (isTouched);
			}
			else if (index == 1)
			{
				// Pan
				masterTrack.getPan ().setIndication (isTouched);
			}
			break;
	
		case MODE_TRACK:
			var selectedTrack = getSelectedTrack ();
			if (selectedTrack == null)
				return;
				
			var t = trackBank.getTrack (selectedTrack.index);
			if (index == 0)
			{
				// Volume
				t.getVolume ().setIndication (isTouched);
			}
			else if (index == 1)
			{
				// Pan
				t.getPan ().setIndication (isTouched);
			}
			else
			{
				// Send 1-6 Volume
				var sel = index - 2;
				var send = selectedTrack.sends[sel];
				t.getSend (send.index).setIndication (isTouched);
			}
			break;
		
		case MODE_VOLUME:
			var t = tracks[index];
			trackBank.getTrack (t.index).getVolume ().setIndication (isTouched);
			break;
			
		case MODE_PAN:
			var t = tracks[index];
			trackBank.getTrack (t.index).getPan ().setIndication (isTouched);
			break;
			
		case MODE_SEND1:
		case MODE_SEND2:
		case MODE_SEND3:
		case MODE_SEND4:
		case MODE_SEND5:
		case MODE_SEND6:
			var sendNo = currentMode - MODE_SEND1;
			var t = tracks[index];
			var send = t.sends[sendNo];
			trackBank.getTrack (t.index).getSend (sendNo).setIndication (isTouched);
			break;
		
		case MODE_DEVICE:
			device.getParameter (index).setIndication (isTouched);
			break;
			
		case MODE_SCALES:
			// Not used
			break;
	}
	*/
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
	
	// TODO (mschmalle) This only seems right if we have a contract with
	// Push that 'Not In Full Display' means we will always have track toggles
	// for the first row, is the correct?
	if (!this.push.isFullDisplayMode (currentMode)) 
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
	if (currentMode != MODE_DEVICE && currentMode != MODE_MASTER && currentMode != MODE_SCALES)
	{
		var t = trackBank.getTrack (index);
		if (this.push.isShiftPressed ())
			; // TODO Toggle monitor; Possible?
		else
			 t.getArm ().set (toggleValue (tracks[index].recarm));
	} 
};

BaseView.prototype.onMaster = function (event)
{
	switch (event.getState ())
	{
		case BUTTON_STATE_UP:
			if (currentMode == MODE_FRAME)
				setMode (previousMode);
			break;
		case BUTTON_STATE_DOWN:
			setMode (MODE_MASTER);
			masterTrack.select ();
			break;
		case BUTTON_STATE_LONG:
			setMode (MODE_FRAME);
			break;
	}
};

BaseView.prototype.onVolume = function (event)
{
	if (event.isDown ())
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
	if (event.isDown ())
		setMode (MODE_TRACK);
};

BaseView.prototype.onDevice = function (event)
{
	if (!event.isDown ())
		return;
	if (currentMode == MODE_DEVICE)
		setMode (MODE_MACRO);
	else
		setMode (MODE_DEVICE);
};

BaseView.prototype.onBrowse = function (event)
{
	if (!event.isDown ())
		return;
	if (currentMode == MODE_DEVICE)
		setMode(MODE_PRESET);
	else
		application.toggleBrowserVisibility (); // Track
};

// Dec Track or Device Parameter Bank
BaseView.prototype.onDeviceLeft = function (event)
{
	if (!event.isDown ())
		return;
	if (currentMode == MODE_DEVICE)
	{
		device.previousParameterPage ();
		return;
	}
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
	if (currentMode == MODE_DEVICE)
	{
		device.nextParameterPage ();
		return;
	}
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
	var selectedTrack = getSelectedTrack ();
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
	var selectedTrack = getSelectedTrack ();
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
		case BUTTON_STATE_DOWN:
			this.quitScalesMode = false;
			setMode (currentMode == MODE_SCALES ? previousMode : MODE_SCALES);
			break;
		case BUTTON_STATE_LONG:
			this.quitScalesMode = true;
			break;
		case BUTTON_STATE_UP:
			if (this.quitScalesMode)
				setMode (previousMode);
			break;
	}
};

BaseView.prototype.onAddFX = function (event)
{
	if (!event.isDown ())
		return;
	// TODO Not possible?
	host.showPopupNotification ("Add Effect: Function not supported (yet).");
};

BaseView.prototype.onAddTrack = function (event)
{
	if (!event.isDown ())
		return;
	// TODO Not possible?
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

BaseView.prototype.onShift = function (event)
{
	this.push.setButton (PUSH_BUTTON_SHIFT, event.isUp () ? PUSH_BUTTON_STATE_ON : PUSH_BUTTON_STATE_HI);
};

function selectTrack (index)
{
	var t = trackBank.getTrack (index);
	if (t != null)
		t.select ();
}