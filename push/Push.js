// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

var PUSH_BUTTON_TAP				= 3;
var PUSH_BUTTON_CLICK           = 9;
var PUSH_BUTTON_MASTER          = 28;
var PUSH_BUTTON_STOP            = 29;
var PUSH_BUTTON_LEFT            = 44;
var PUSH_BUTTON_RIGHT           = 45;
var PUSH_BUTTON_UP              = 46;
var PUSH_BUTTON_DOWN            = 47;
var PUSH_BUTTON_SELECT          = 48;
var PUSH_BUTTON_SHIFT           = 49;
var PUSH_BUTTON_NOTE            = 50;
var PUSH_BUTTON_SESSION         = 51;
var PUSH_BUTTON_ADD_EFFECT      = 52;
var PUSH_BUTTON_ADD_TRACK       = 53;
var PUSH_BUTTON_OCTAVE_DOWN     = 54;
var PUSH_BUTTON_OCTAVE_UP       = 55;
var PUSH_BUTTON_REPEAT          = 56;
var PUSH_BUTTON_ACCENT          = 57;
var PUSH_BUTTON_SCALES          = 58;
var PUSH_BUTTON_USER_MODE       = 59;
var PUSH_BUTTON_MUTE            = 60;
var PUSH_BUTTON_SOLO            = 61;
var PUSH_BUTTON_DEVICE_LEFT     = 62;
var PUSH_BUTTON_DEVICE_RIGHT    = 63;
var PUSH_BUTTON_PLAY            = 85;
var PUSH_BUTTON_RECORD          = 86;
var PUSH_BUTTON_NEW             = 87;
var PUSH_BUTTON_DUPLICATE       = 88;
var PUSH_BUTTON_AUTOMATION      = 89;
var PUSH_BUTTON_FIXED_LENGTH    = 90;
var PUSH_BUTTON_DEVICE          = 110;
var PUSH_BUTTON_BROWSE          = 111;
var PUSH_BUTTON_TRACK           = 112;
var PUSH_BUTTON_CLIP            = 113;
var PUSH_BUTTON_VOLUME          = 114;
var PUSH_BUTTON_PAN_SEND        = 115;
var PUSH_BUTTON_QUANTIZE        = 116;
var PUSH_BUTTON_DOUBLE          = 117;
var PUSH_BUTTON_DELETE          = 118;
var PUSH_BUTTON_UNDO            = 119;

var PUSH_BUTTON_SCENE1          = 36;	// 1/4
var PUSH_BUTTON_SCENE2          = 37;	
var PUSH_BUTTON_SCENE3          = 38;
var PUSH_BUTTON_SCENE4          = 39;
var PUSH_BUTTON_SCENE5          = 40;	// ...
var PUSH_BUTTON_SCENE6          = 41;
var PUSH_BUTTON_SCENE7          = 42;
var PUSH_BUTTON_SCENE8          = 43;	// 1/32T

var PUSH_KNOB1                  = 71;
var PUSH_KNOB2                  = 72;
var PUSH_KNOB3                  = 73;
var PUSH_KNOB4                  = 74;
var PUSH_KNOB5                  = 75;
var PUSH_KNOB6                  = 76;
var PUSH_KNOB7                  = 77;
var PUSH_KNOB8                  = 78;
var PUSH_KNOB9                  = 79;

var PUSH_KNOB1_TOUCH       = 0;
var PUSH_KNOB2_TOUCH       = 1;
var PUSH_KNOB3_TOUCH       = 2;
var PUSH_KNOB4_TOUCH       = 3;
var PUSH_KNOB5_TOUCH       = 4;
var PUSH_KNOB6_TOUCH       = 5;
var PUSH_KNOB7_TOUCH       = 6;
var PUSH_KNOB8_TOUCH       = 7;
var PUSH_KNOB9_TOUCH       = 8;
var PUSH_SMALL_KNOB1_TOUCH = 10;
var PUSH_SMALL_KNOB2_TOUCH = 9;

var PUSH_FOOTSWITCH1 = 64;
var PUSH_FOOTSWITCH2 = 69;

var PUSH_BUTTON_STATE_OFF = 0;
var PUSH_BUTTON_STATE_ON  = 1;
var PUSH_BUTTON_STATE_HI  = 4;

function Push (output, input)
{
	this.output = output;
	this.input = input;

	this.input.setMidiCallback (doObject (this, this.handleMidi));

	this.pads = new Grid (output);
	this.display = new Display (output);

	this.viewState = null;
	this.modeState = null;

	this.showVU = true;

	this.displayScheduled = false;
	this.taskReturning = false;
	
	this.buttonStates = [];
}

Push.prototype.init = function ()
{
	this.model = new Model (this);

	this.viewState = new ViewState (this, this.model);
	this.modeState = new ModeState (this, this.model);

	var len = this.viewState.getButtons ().length;
	for (var i = 0; i < len; i++)
		this.buttonStates[this.viewState.getButton (i)] = ButtonEvent.UP;

	// Create Push Views
	this.viewState.init ();

	// Create Push Mode impls
	this.modeState.init ();
};

Push.prototype.flush = function ()
{
	if (this.taskReturning)
	{
		this.taskReturning = false;
		return;
	}

	if (!this.displayScheduled)
	{
		this.displayScheduled = true;
		host.scheduleTask (doObject (this, function ()
		{
			this.updateDisplay ();
			this.display.flush ();
			this.displayScheduled = false;
			this.taskReturning = true;
		}), null, 5);
	}
	this.redrawGrid ();
};

Push.prototype.turnOff = function ()
{
	// Clear display
	for (var i = 0; i < 4; i++)
		this.display.clearRow (i);

	// Turn off all buttons
	this.viewState.turnOff ();

	this.pads.turnOff ();
};

/**
 * @returns {MidiOutput}
 */
Push.prototype.getOutput = function () { return this.output; };

/**
 * @returns {Model}
 */
Push.prototype.getModel = function () { return this.model; };

//--------------------------------------
// ViewState
//--------------------------------------

Push.prototype.setActiveView = function (viewId)
{
	this.viewState.setActiveView (viewId);
};

Push.prototype.getActiveView = function ()
{
	return this.viewState.getActiveView ();
};

Push.prototype.isActiveView = function (viewId)
{
	return this.viewState.isActiveView (viewId);
};

//--------------------------------------
// ModeState
//--------------------------------------

Push.prototype.setPendingMode = function (mode)
{
	this.modeState.setPendingMode (mode);
}

Push.prototype.getPreviousMode = function ()
{
	return this.modeState.getPreviousMode ();
};

Push.prototype.getCurrentMode = function ()
{
	return this.modeState.getCurrentMode ();
};

Push.prototype.getActiveMode = function ()
{
	return this.modeState.getActiveMode ();
};

Push.prototype.setActiveMode = function (modeId)
{
	this.modeState.setActiveMode (modeId);
};

Push.prototype.isActiveMode = function (modeId)
{
	return this.modeState.isActiveMode (modeId);
};

Push.prototype.getMode = function (modeId)
{
	return this.modeState.getMode (modeId);
};

Push.prototype.updateMode = function (mode)
{
	this.modeState.updateMode (mode);
}

//--------------------------------------
// Gesture
//--------------------------------------

Push.prototype.isSelectPressed = function ()
{
	return this.isPressed (PUSH_BUTTON_SELECT);
};

Push.prototype.isShiftPressed = function ()
{
	return this.isPressed (PUSH_BUTTON_SHIFT);
};

Push.prototype.isDeletePressed = function ()
{
	return this.isPressed (PUSH_BUTTON_DELETE);
};

Push.prototype.isPressed = function (button)
{
	return this.buttonStates[button] != ButtonEvent.UP;
};

//--------------------------------------
// Display
//--------------------------------------

Push.prototype.setButton = function (button, state)
{
	this.output.sendCC (button, state);
};

Push.prototype.redrawGrid = function ()
{
	var view = this.getActiveView ();
	if (view == null)
		return;
	view.drawGrid ();
	this.pads.flush ();
};

Push.prototype.updateDisplay = function ()
{
	var t = this.model.getTrackBank ().getSelectedTrack ();
	var d = this.display;
	
	var m = this.getActiveMode ();
	if (m != null)
		m.updateDisplay ();

	if (m != null && m.isFullDisplay (this.getCurrentMode ()))
		return;

	// Send, Mute, Automation
	if (t == null)
	{
		this.setButton (PUSH_BUTTON_MUTE, PUSH_BUTTON_STATE_OFF);
		this.setButton (PUSH_BUTTON_SOLO, PUSH_BUTTON_STATE_OFF);
		this.setButton (PUSH_BUTTON_AUTOMATION, PUSH_BUTTON_STATE_OFF);
	}
	else
	{
		this.setButton (PUSH_BUTTON_MUTE, t.mute ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
		this.setButton (PUSH_BUTTON_SOLO, t.solo ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
		this.setButton (PUSH_BUTTON_AUTOMATION, t.autowrite ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	}

	// Format track names
	var sel = t == null ? -1 : t.index;
	for (var i = 0; i < 8; i++)
	{
		var isSel = i == sel;
		var t = this.model.getTrackBank ().getTrack (i);
		var n = optimizeName (t.name, isSel ? 7 : 8);
		d.setCell (3, i, isSel ? Display.RIGHT_ARROW + n : n, Display.FORMAT_RAW);
		
		// Light up selection and record/monitor buttons
		this.setButton (20 + i, isSel ? PUSH_COLOR_ORANGE_LO : PUSH_COLOR_BLACK);
		if (this.isShiftPressed ())
			this.setButton (102 + i, t.monitor ? PUSH_COLOR_GREEN_LO : PUSH_COLOR_BLACK);
		else
			this.setButton (102 + i, t.recarm ? PUSH_COLOR_RED_LO : PUSH_COLOR_BLACK);
	}
	d.done (3);
}

//--------------------------------------
// Handlers
//--------------------------------------

Push.prototype.handleMidi = function (status, data1, data2)
{
	switch (status & 0xF0)
	{	
		case 0x80:
		case 0x90:
			if (data1 >= 36 && data1 < 100)
				this.handleGrid (data1, data2);
			else
				this.handleTouch (data1, data2);
			break;

		case 0xB0:
			this.handleCC (data1, data2);
			break;
	}
};

Push.prototype.handleGrid = function (note, velocity)
{
	var view = this.getActiveView ();
	if (view != null)
		view.onGrid (note, velocity);
};

Push.prototype.handleCC = function (cc, value)
{
	if (this.isButton (cc))
	{
		this.buttonStates[cc] = value == 127 ? ButtonEvent.DOWN : ButtonEvent.UP;
		if (this.buttonStates[cc] == ButtonEvent.DOWN)
		{
			host.scheduleTask (function (object, buttonID)
			{
				object.checkButtonState (buttonID);
			}, [this, cc], 400);
		}
	}
	
	this.handleEvent (cc, value);
};

Push.prototype.handleEvent = function (cc, value)
{
	var view = this.getActiveView ();
	if (view == null)
		return;
		
	var event = this.isButton (cc) ? new ButtonEvent (this.buttonStates[cc]) : null;
		
	switch (cc)
	{
		// Tap Tempo
		case PUSH_BUTTON_TAP:
			view.onTapTempo (event);
			break;
	
		// Click
		case PUSH_BUTTON_CLICK:
			view.onClick (event);
			break;

		// Small knob 1 (rastered)
		case 14:
			view.onSmallKnob1 (value == 1);
			break;

		// Small knob 2 (not rastered)
		case 15:
			view.onSmallKnob2 (value <= 61);
			break;
			
		// 1st button row below display
		case 20:
		case 21:
		case 22:
		case 23:
		case 24:
		case 25:
		case 26:
		case 27:
			if (value == 127)
				view.onFirstRow (cc - 20);
			break;
			
		// Select Master track
		case PUSH_BUTTON_MASTER:
			view.onMaster (event);
			break;

		// Stop
		case PUSH_BUTTON_STOP:
			view.onStop (event);
			break;

		// Scene buttons
		case 36:	// 1/4
		case 37:	
		case 38:
		case 39:
		case 40:	// ...
		case 41:
		case 42:
		case 43:	// 1/32T
			if (value == 127)
				view.onScene (7 - (cc - 36));
			break;

		// Left
		case PUSH_BUTTON_LEFT:
			view.onLeft (event);
			break;
			
		// Right
		case PUSH_BUTTON_RIGHT:
			view.onRight (event);
			break;

		// Up
		case PUSH_BUTTON_UP:
			view.onUp (event);
			break;

		// Down
		case PUSH_BUTTON_DOWN:
			view.onDown (event);
			break;

		// Select
		case PUSH_BUTTON_SELECT:
			if (view.usesButton (PUSH_BUTTON_SELECT))
				this.setButton (PUSH_BUTTON_SELECT, event.isUp () ? PUSH_BUTTON_STATE_ON : PUSH_BUTTON_STATE_HI);
			view.onSelect (event);
			break;

		// Shift Key
		case PUSH_BUTTON_SHIFT:
			view.onShift (event);
			break;

		// Play Note Mode
		case PUSH_BUTTON_NOTE:
			view.onNote (event);
			break;

		// Play Session Mode
		case PUSH_BUTTON_SESSION:
			view.onSession (event);
			break;

		// Add FX
		case PUSH_BUTTON_ADD_EFFECT:
			view.onAddFX (event);
			break;
			
		// Add Track
		case PUSH_BUTTON_ADD_TRACK:
			view.onAddTrack (event);
			break;

		// Octave Down
		case PUSH_BUTTON_OCTAVE_DOWN:
			view.onOctaveDown (event);
			break;
			
		// Octave Up
		case PUSH_BUTTON_OCTAVE_UP:
			view.onOctaveUp (event);
			break;

		// Repeat
		case PUSH_BUTTON_REPEAT:
			view.onRepeat (event);
			break;

		// Accent
		case PUSH_BUTTON_ACCENT:
			view.onAccent (event);
			break;
			
		// Scales
		case PUSH_BUTTON_SCALES:
			view.onScales (event);
			break;

		// User Mode
		case PUSH_BUTTON_USER_MODE:
			view.onUser (event);
			break;

		// Mute
		case PUSH_BUTTON_MUTE:
			view.onMute (event);
			break;
			
		// Solo
		case PUSH_BUTTON_SOLO:
			view.onSolo (event);
			break;

		// Decrease selected device
		case PUSH_BUTTON_DEVICE_LEFT:
			view.onDeviceLeft (event);
			break;
		
		// Increase selected device
		case PUSH_BUTTON_DEVICE_RIGHT:
			view.onDeviceRight (event);
			break;
			
		// Value Knobs 1-8
		case 71:
		case 72:
		case 73:
		case 74:
		case 75:
		case 76:
		case 77:
		case 78:
			view.onValueKnob (cc - 71, value);
			break;
			
		// Value knob 9
		case 79:
			view.onValueKnob9 (value);
			break;
			
		// Play
		case PUSH_BUTTON_PLAY:
			view.onPlay (event);
			break;
			
		// Record
		case PUSH_BUTTON_RECORD:
			view.onRecord (event);
			break;
			
		// New
		case PUSH_BUTTON_NEW:
			view.onNew (event);
			break;
			
		// Duplicate
		case PUSH_BUTTON_DUPLICATE:
			view.onDuplicate (event);
			break;
			
		// Automation
		case PUSH_BUTTON_AUTOMATION:
			view.onAutomation (event);
			break;
			
		// Fixed Length
		case PUSH_BUTTON_FIXED_LENGTH:
			view.onFixedLength (event);
			break;
			
		// 2nd button row below display
		case 102:
		case 103:
		case 104:
		case 105:
		case 106:
		case 107:
		case 108:
		case 109:
			if (value == 127)
				view.onSecondRow (cc - 102);
			break;
			
		// Device Mode
		case PUSH_BUTTON_DEVICE:
			view.onDevice (event);
			break;
			
		// Browse
		case PUSH_BUTTON_BROWSE:
			view.onBrowse (event);
			break;
			
	 	// Track Mode
		case PUSH_BUTTON_TRACK:
			view.onTrack (event);
			break;

	 	// Clip Mode
		case PUSH_BUTTON_CLIP:
			view.onClip (event);
			break;

		// Volume Mode
		case PUSH_BUTTON_VOLUME:
			view.onVolume (event);
			break;
			
		// Pan & Send Mode
		case PUSH_BUTTON_PAN_SEND:
			view.onPanAndSend (event);
			break;
		
		// Quantize
		case PUSH_BUTTON_QUANTIZE:
			view.onQuantize (event);
			break;

		// Double
		case PUSH_BUTTON_DOUBLE:
			view.onDouble (event);
			break;
			
		// Delete
		case PUSH_BUTTON_DELETE:
			view.onDelete (event);
			break;
			
		// Undo
		case PUSH_BUTTON_UNDO:
			view.onUndo (event);
			break;
			
		// Note: Sustain already directly send to the DAW
		case PUSH_FOOTSWITCH1:
			view.onFootswitch1 (value);
			break;

		case PUSH_FOOTSWITCH2:
			view.onFootswitch2 (value);
			break;
			
		default:
			println (cc);
			break;
	}
};

Push.prototype.handleTouch = function (knob, value)
{
	var view = this.getActiveView ();
	if (view == null)
		return;
		
	switch (knob)
	{
		case PUSH_KNOB1_TOUCH:
		case PUSH_KNOB2_TOUCH:
		case PUSH_KNOB3_TOUCH:
		case PUSH_KNOB4_TOUCH:
		case PUSH_KNOB5_TOUCH:
		case PUSH_KNOB6_TOUCH:
		case PUSH_KNOB7_TOUCH:
		case PUSH_KNOB8_TOUCH:
			view.onValueKnobTouch (knob, value == 127);
			break;

		case PUSH_KNOB9_TOUCH:
			view.onValueKnob9Touch (value == 127);
			break;
			
		case PUSH_SMALL_KNOB1_TOUCH:
			view.onSmallKnob1Touch (value == 127);
			break;
			
		case PUSH_SMALL_KNOB2_TOUCH:
			view.onSmallKnob1Touch (value == 127);
			break;
	}
};

Push.prototype.checkButtonState = function (buttonID)
{
	if (this.buttonStates[buttonID] != ButtonEvent.DOWN)
		return;
		
	this.buttonStates[buttonID] = ButtonEvent.LONG;
	this.handleEvent (buttonID, 127);
};

Push.prototype.isButton = function (cc)
{
	return typeof (this.buttonStates[cc]) != 'undefined';
};