// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

var TEMPO_RESOLUTION = 647;

loadAPI (1);
load ("helper/ClassLoader.js");
load ("daw/ClassLoader.js");
load ("push/ClassLoader.js");
load ("view/ClassLoader.js");
load ("mode/ClassLoader.js");

var displayScheduled = false;

var previousMode = MODE_TRACK;
var currentMode = MODE_TRACK;
var tempo = 100;	// Note: For real BPM add 20
var quarterNoteInMillis = calcQuarterNoteInMillis (tempo);
var master =
{ 
	selected: false,
	canHoldNotes: false,
	sends: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }, { index: 5 }],
};

var tracks = [];
for (var i = 0; i < 8; i++)
	tracks[i] = 
	{ 
		index: i,
		selected: false,
		sends: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }, { index: 5 }],
		slots: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }, { index: 5 }, { index: 6 }, { index: 7 }]
	};
var fxparams = [ { index: 0, name: '' }, { index: 1, name: '' }, { index: 2, name: '' }, { index: 3, name: '' }, { index: 4, name: '' }, { index: 5, name: '' }, { index: 6, name: '' }, { index: 7, name: '' } ];
var macros = [ { index: 0, name: '' }, { index: 1, name: '' }, { index: 2, name: '' }, { index: 3, name: '' }, { index: 4, name: '' }, { index: 5, name: '' }, { index: 6, name: '' }, { index: 7, name: '' } ];
var selectedDevice =
{
	name: 'None',
	hasPreviousDevice: false, 
	hasNextDevice: false
};

var transport = null;
var application = null;
var device = null;
var masterTrack = null;
var trackBank = null;
var noteInput = null;

var canScrollTrackUp   = false;
var canScrollTrackDown = false;

var currentNewClipLength = 2; // 1 Bar

var output = null;
var push   = null;

host.defineController ("Ableton", "Push", "1.0", "D69AFBF0-B71E-11E3-A5E2-0800200C9A66");
host.defineMidiPorts (1, 1);
host.addDeviceNameBasedDiscoveryPair (["MIDIIN2 (Ableton Push)"], ["MIDIOUT2 (Ableton Push)"]);
host.addDeviceNameBasedDiscoveryPair (["Ableton Push MIDI 2"], ["Ableton Push MIDI 2"]);

function init()
{
	var port = host.getMidiInPort (0);
	port.setMidiCallback (onMidi);
	noteInput = port.createNoteInput ("Ableton Push", "80????", "90????", "E0????");
	noteInput.setShouldConsumeEvents (false);
	
	application = host.createApplication ();
	device = host.createCursorDevice ();
	transport = host.createTransport ();
	masterTrack = host.createMasterTrack (0);
	trackBank = host.createMainTrackBankSection (8, 6, 8);

	output = new MidiOutput ();
	push = new Push (output);
	
	// TODO (mschmalle) This needs to be put some where that makes sense and could 
	// possibly in the future configure different transport actions, since its not a mode
	// it's still here (IE Shift + Record, Record, etc.) so Like PushTransport class?
	// Click
	transport.addClickObserver (function (isOn)
	{
		push.setButton (PUSH_BUTTON_CLICK, isOn ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	});
	// Play
	transport.addIsPlayingObserver (function (isPlaying)
	{
		push.setButton (PUSH_BUTTON_PLAY, isPlaying ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	});
	// Record
	transport.addIsRecordingObserver (function (isRecording)
	{
		push.setButton (PUSH_BUTTON_RECORD, isRecording ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	});
	// Tempo
	transport.getTempo ().addValueObserver(TEMPO_RESOLUTION, function (value)
	{
		tempo = value;
		quarterNoteInMillis = calcQuarterNoteInMillis (tempo);
	});

	push.init ();
	
	push.setActiveView (VIEW_PLAY);
	push.setActiveMode (MODE_TRACK);
	
	println ("Initialized.");
}

function exit()
{
	this.push.turnOff ();
}

// TODO The is some callback in an observer or something that is making flush()
//   run in a continuous loop
function flush ()
{
	if (!displayScheduled)
	{
		host.scheduleTask (function ()
		{
			updateDisplay ();
			push.display.flush ();
			displayScheduled = false;
		}, null, 5);
		displayScheduled = true;
	}
	push.redrawGrid ();
}

function onMidi (status, data1, data2)
{
	push.handleMidi (status, data1, data2);
}

function getSelectedTrack ()
{
	for (var i = 0; i < 8; i++)
		if (tracks[i].selected)
			return tracks[i];
	return null;
}

function getSelectedSlot (track)
{
	for (var i = 0; i < track.slots.length; i++)
		if (track.slots[i].isSelected)
			return i;
	return -1;
}

// TODO Move to Push.js incl. currentMode, previousMode
function setMode (mode)
{
	if (mode == null)
		mode = MODE_TRACK;
	if (mode != currentMode)
	{
		if (currentMode != MODE_SCALES && currentMode != MODE_FIXED)
			previousMode = currentMode;
		currentMode = mode;
		push.setActiveMode(currentMode);
	}
	updateMode (-1);
	updateMode (currentMode);
}

function updateMode (mode)
{
	var isMaster = mode == MODE_MASTER;
	var isTrack  = mode == MODE_TRACK;
	var isVolume = mode == MODE_VOLUME;
	var isPan    = mode == MODE_PAN;
	var isDevice = mode == MODE_DEVICE;
	var isMacro  = mode == MODE_MACRO;
	var isScales = mode == MODE_SCALES;
	var isFixed  = mode == MODE_FIXED;
	var isPreset = mode == MODE_PRESET;
	var isFrame  = mode == MODE_FRAME;
	
	masterTrack.getVolume ().setIndication (isMaster);
	masterTrack.getPan ().setIndication (isMaster);
	
	var selectedTrack = getSelectedTrack ();
	for (var i = 0; i < 8; i++)
	{
		var t = trackBank.getTrack (i);
		var hasTrackSel = selectedTrack != null && selectedTrack.index == i && mode == MODE_TRACK;
		t.getVolume ().setIndication (isVolume || hasTrackSel);
		t.getPan ().setIndication (isPan || hasTrackSel);
		for (var j = 0; j < 6; j++)
		{
			isEnabled = mode == MODE_SEND1 && j == 0 ||
			            mode == MODE_SEND2 && j == 1 ||
			            mode == MODE_SEND3 && j == 2 ||
			            mode == MODE_SEND4 && j == 3 ||
			            mode == MODE_SEND5 && j == 4 ||
			            mode == MODE_SEND6 && j == 5 || 
						hasTrackSel;
			t.getSend (j).setIndication (isEnabled);
		}

		device.getParameter (i).setIndication (isDevice);
		device.getMacro (i).getAmount ().setIndication (isMacro);
	}
			
	push.setButton (PUSH_BUTTON_MASTER, isMaster || isFrame ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_TRACK, isTrack ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_VOLUME, isVolume ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_PAN_SEND, mode >= MODE_PAN && mode <= MODE_SEND6 ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_DEVICE, isDevice || isMacro ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_SCALES, isScales ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_FIXED_LENGTH, isFixed ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_BROWSE, isPreset ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
}

function updateDisplay ()
{
	var t = getSelectedTrack ();
	var d = push.display;
	
	var m = push.getActiveMode ();

	if (m != null)
		m.updateDisplay ();

	if (push.isFullDisplayMode(currentMode))
		return;

	// Send, Mute, Automation
	if (t == null)
	{
		push.setButton (PUSH_BUTTON_MUTE, PUSH_BUTTON_STATE_OFF);
		push.setButton (PUSH_BUTTON_SOLO, PUSH_BUTTON_STATE_OFF);
		push.setButton (PUSH_BUTTON_AUTOMATION, PUSH_BUTTON_STATE_OFF);
	}
	else
	{
		push.setButton (PUSH_BUTTON_MUTE, t.mute ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
		push.setButton (PUSH_BUTTON_SOLO, t.solo ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
		push.setButton (PUSH_BUTTON_AUTOMATION, t.autowrite ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	}

	// Format track names
	var sel = t == null ? -1 : t.index;
	for (var i = 0; i < 8; i++)
	{
		var isSel = i == sel;
		var n = optimizeName (tracks[i].name, isSel ? 7 : 8);
		d.setCell (3, i, isSel ? Display.RIGHT_ARROW + n : n, Display.FORMAT_RAW);
		
		// Light up selection and record/monitor buttons
		push.setButton (20 + i, isSel ? PUSH_COLOR_ORANGE_LO : PUSH_COLOR_BLACK);
		if (push.isShiftPressed ())
			push.setButton (102 + i, tracks[i].monitor ? PUSH_COLOR_GREEN_LO : PUSH_COLOR_BLACK);
		else
			push.setButton (102 + i, tracks[i].recarm ? PUSH_COLOR_RED_LO : PUSH_COLOR_BLACK);
	}
	d.done (3);
}

function calcQuarterNoteInMillis (tempo)
{
	return 60000 / (tempo + 20);
}
