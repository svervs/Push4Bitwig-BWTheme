// Written by Jürgen Moßgraber - mossgrabers.de
// Contributions by Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

// Static  Headers
var PARAM_NAMES_MASTER = 'Volume   Pan                                                        ';
var PARAM_NAMES_TRACK  = 'Volume   Pan     Send 1   Send 2  Send 3   Send 4  Send 5   Send 6  ';
var PARAM_NAMES_VOLUME = 'Volume   Volume  Volume   Volume  Volume   Volume  Volume   Volume  ';
var PARAM_NAMES_PAN    = 'Pan      Pan     Pan      Pan     Pan      Pan     Pan      Pan     ';
var PARAM_NAMES_SEND   =
[
	'Send 1   Send 1  Send 1   Send 1  Send 1   Send 1  Send 1   Send 1  ',
	'Send 2   Send 2  Send 2   Send 2  Send 2   Send 2  Send 2   Send 2  ',
	'Send 3   Send 3  Send 3   Send 3  Send 3   Send 3  Send 3   Send 3  ',
	'Send 4   Send 4  Send 4   Send 4  Send 4   Send 4  Send 4   Send 4  ',
	'Send 5   Send 5  Send 5   Send 5  Send 5   Send 5  Send 5   Send 5  ',
	'Send 6   Send 6  Send 6   Send 6  Send 6   Send 6  Send 6   Send 6  '
];
var CLIP_LENGTHS = [ '1 Beat', '2 Beats', '1 Bar', '2 Bars', '4 Bars', '8 Bars', '16 Bars', '32 Bars' ];

var BITWIG_COLORS =
[
	[ 0.3294117748737335 , 0.3294117748737335 , 0.3294117748737335 , 1],	// Dark Gray
	[ 0.47843137383461   , 0.47843137383461   , 0.47843137383461   , 2],	// Gray
	[ 0.7882353067398071 , 0.7882353067398071 , 0.7882353067398071 , 3],	// Light Gray
	[ 0.5254902243614197 , 0.5372549295425415 , 0.6745098233222961 , 40], 	// Silver
	[ 0.6392157077789307 , 0.4745098054409027 , 0.26274511218070984, 11],	// Dark Brown
	[ 0.7764706015586853 , 0.6235294342041016 , 0.43921568989753723, 12],	// Brown
	[ 0.34117648005485535, 0.3803921639919281 , 0.7764706015586853 , 42],	// Dark Blue
	[ 0.5176470875740051 , 0.5411764979362488 , 0.8784313797950745 , 44],	// Light Blue
	[ 0.5843137502670288 , 0.2862745225429535 , 0.7960784435272217 , 58],	// Purple
	[ 0.8509804010391235 , 0.21960784494876862, 0.4431372582912445 , 57],	// Pink
	[ 0.8509804010391235 , 0.18039216101169586, 0.1411764770746231 , 6],	// Red
	[ 1                  , 0.34117648005485535, 0.0235294122248888 , 60],	// Orange
	[ 0.8509804010391235 , 0.615686297416687  , 0.062745101749897  , 62],	// Light Orange
	[ 0.45098039507865906, 0.5960784554481506 , 0.0784313753247261 , 18],	// Green
	[ 0                  , 0.615686297416687  , 0.27843138575553894, 26],	// Cold Green
	[ 0                  , 0.6509804129600525 , 0.5803921818733215 , 30],	// Bluish Green
	[ 0                  , 0.6000000238418579 , 0.8509804010391235 , 37],	// Light Blue
	[ 0.7372549176216125 , 0.4627451002597809 , 0.9411764740943909 , 48],	// Light Purple
	[ 0.8823529481887817 , 0.4000000059604645 , 0.5686274766921997 , 56],	// Light Pink
	[ 0.9254902005195618 , 0.3803921639919281 , 0.34117648005485535, 4],	// Skin
	[ 1                  , 0.5137255191802979 , 0.24313725531101227, 10],	// Redish Brown
	[ 0.8941176533699036 , 0.7176470756530762 , 0.30588236451148987, 61],	// Light Brown
	[ 0.6274510025978088 , 0.7529411911964417 , 0.2980392277240753 , 18],	// Light Green
	[ 0.24313725531101227, 0.7333333492279053 , 0.3843137323856354 , 25],	// Bluish Green
	[ 0.26274511218070984, 0.8235294222831726 , 0.7254902124404907 , 32],	// Light Blue
	[ 0.2666666805744171 , 0.7843137383460999 , 1                  , 41]	// Blue
];

var INC_FRACTION_VALUE     = 1;
var INC_FRACTION_TIME      = 1.0;	    // 1 beat
var INC_FRACTION_TIME_SLOW = 1.0 / 20;	// 1/20th of a beat
var TEMPO_RESOLUTION       = 647;

var VIEW_PLAY      = 0;
var VIEW_SESSION   = 1;
var VIEW_SEQUENCER = 2;
var VIEW_DRUM      = 3;

loadAPI(1);
load("Utilities.js");
load("MidiOutput.js");
load("View.js");
load("BaseView.js");
load("Push.js");
load("PushModes.js");
load("Scales.js");
load("PlayView.js");
load("SessionView.js");
load("SequencerView.js");
load("DrumView.js");

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

var currentScaleOffset   = 0; // C
var currentScale         = 1; // Major
var currentOctave        = 0;
var currentNewClipLength = 2; // 1 Bar

var output        = null;
var push          = null;
var playView      = null;
var sessionView   = null;
var sequencerView = null;
var drumView      = null;

host.defineController ("Ableton", "Push", "1.0", "D69AFBF0-B71E-11E3-A5E2-0800200C9A66");
host.defineMidiPorts (1, 1);
host.addDeviceNameBasedDiscoveryPair (["MIDIIN2 (Ableton Push)"], ["MIDIOUT2 (Ableton Push)"]);
host.addDeviceNameBasedDiscoveryPair (["Ableton Push MIDI 2"], ["Ableton Push MIDI 2"]);

function init()
{
	var port = host.getMidiInPort(0);
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
	
	playView = new PlayView ();
	sessionView = new SessionView ();
	sequencerView = new SequencerView ();
	drumView = new DrumView ();
	push.addView (VIEW_PLAY, playView);
	push.addView (VIEW_SESSION, sessionView);
	push.addView (VIEW_SEQUENCER, sequencerView);
	push.addView (VIEW_DRUM, drumView);

	push.addMode (MODE_VOLUME, new VolumeMode ());
	push.addMode (MODE_PAN, new PanMode ());
	var modeSend = new SendMode ();
	push.addMode (MODE_SEND1, modeSend);
	push.addMode (MODE_SEND2, modeSend);
	push.addMode (MODE_SEND3, modeSend);
	push.addMode (MODE_SEND4, modeSend);
	push.addMode (MODE_SEND5, modeSend);
	push.addMode (MODE_SEND6, modeSend);
	push.addMode (MODE_MASTER, new MasterMode ());
	push.addMode (MODE_TRACK, new TrackMode ());
	push.addMode (MODE_DEVICE, new DeviceMode ());
	push.addMode (MODE_MACRO, new MacroMode ());
	push.addMode (MODE_FRAME, new FrameMode ());
	push.addMode (MODE_PRESET, new PresetMode ());
	push.addMode (MODE_SCALES, new ScalesMode ());
	push.addMode (MODE_FIXED, new FixedMode ());
	
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
	
 	trackBank.addCanScrollTracksDownObserver (function (canScroll)
	{
		canScrollTrackDown = canScroll;
	});
	trackBank.addCanScrollTracksUpObserver (function (canScroll)
	{
		canScrollTrackUp = canScroll;
	});
	
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
		d.setCell (3, i, isSel ? RIGHT_ARROW + n : n, PushDisplay.FORMAT_RAW);
		
		// Light up selection and record/monitor buttons
		push.setButton (20 + i, isSel ? PUSH_COLOR_ORANGE_LO : PUSH_COLOR_BLACK);
		if (push.isShiftPressed ())
			push.setButton (102 + i, tracks[i].monitor ? PUSH_COLOR_GREEN_LO : PUSH_COLOR_BLACK);
		else
			push.setButton (102 + i, tracks[i].recarm ? PUSH_COLOR_RED_LO : PUSH_COLOR_BLACK);
	}
	d.done (3);
}

function getColorIndex (red, green, blue)
{
	for (var i = 0; i < BITWIG_COLORS.length; i++)
	{
		var color = BITWIG_COLORS[i];
		if (Math.abs (color[0] - red ) < 0.0001 &&
			Math.abs (color[1] - green) < 0.0001 &&
			Math.abs (color[2] - blue) < 0.0001)
			return color[3];
	}
	return null;
}

function changeValue (control, value)
{
	return control <= 61 ? Math.min (value + INC_FRACTION_VALUE, 127) : Math.max (value - INC_FRACTION_VALUE, 0);
}

function calcQuarterNoteInMillis (tempo)
{
	return 60000 / (tempo + 20);
}
