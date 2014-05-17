// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

loadAPI (1);
load ("Config.js");
load ("helper/ClassLoader.js");
load ("daw/ClassLoader.js");
load ("push/ClassLoader.js");
load ("view/ClassLoader.js");
load ("mode/ClassLoader.js");

var previousMode = MODE_TRACK;
var currentMode = MODE_TRACK;

var selectedDevice =
{
	name: 'None',
	hasPreviousDevice: false, 
	hasNextDevice: false
};

var device = null;
var masterTrack = null;
var trackBank = null;
var noteInput = null;
var userControlBank = null;

var canScrollTrackUp   = false;
var canScrollTrackDown = false;

var currentNewClipLength = 2; // 1 Bar

var push = null;

host.defineController ("Ableton", "Push", "2.51", "D69AFBF0-B71E-11E3-A5E2-0800200C9A66");
host.defineMidiPorts (1, 1);
host.addDeviceNameBasedDiscoveryPair (["MIDIIN2 (Ableton Push)"], ["MIDIOUT2 (Ableton Push)"]);
host.addDeviceNameBasedDiscoveryPair (["Ableton Push MIDI 2"], ["Ableton Push MIDI 2"]);

function init()
{
	var port = host.getMidiInPort (0);
	port.setMidiCallback (onMidi);
	noteInput = port.createNoteInput ("Ableton Push", "80????", "90????", "E0????", "B040??" /* Sustainpedal */);
	noteInput.setShouldConsumeEvents (false);
	
	device = host.createCursorDevice ();
	masterTrack = host.createMasterTrack (0);
	trackBank = host.createMainTrackBankSection (8, 6, 8);
	userControlBank = host.createUserControls (8);

	for (var i = PUSH_KNOB1; i <= PUSH_KNOB8; i++)
		userControlBank.getControl (i - PUSH_KNOB1).setLabel ("CC" + i);

	var output = new MidiOutput ();
	push = new Push (output);
	push.init ();
	push.setActiveView (VIEW_PLAY);
	push.setActiveMode (MODE_TRACK);
	
	println ("Initialized.");
}

function exit()
{
	push.turnOff ();
}

function flush ()
{
	push.flush ();
}

function onMidi (status, data1, data2)
{
	push.handleMidi (status, data1, data2);
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
	var isMaster       = mode == MODE_MASTER;
	var isTrack        = mode == MODE_TRACK;
	var isVolume       = mode == MODE_VOLUME;
	var isPan          = mode == MODE_PAN;
	var isScales       = mode == MODE_SCALES;
	var isFixed        = mode == MODE_FIXED;
	var isPreset       = mode == MODE_PRESET;
	var isFrame        = mode == MODE_FRAME;
	var isGroove       = mode == MODE_GROOVE;

	var isBankDevice   = mode == MODE_BANK_DEVICE;
	var isBankCommon   = mode == MODE_BANK_COMMON;
	var isBankEnvelope = mode == MODE_BANK_ENVELOPE;
	var isBankUser     = mode == MODE_BANK_USER;
	var isBankMacro    = mode == MODE_BANK_MACRO;
	
	masterTrack.getVolume ().setIndication (isMaster);
	masterTrack.getPan ().setIndication (isMaster);
	
	var selectedTrack = push.model.getSelectedTrack ();
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

		device.getParameter (i).setIndication (isBankDevice);
		device.getCommonParameter (i).setIndication (isBankCommon);
		device.getEnvelopeParameter (i).setIndication(isBankEnvelope)
		userControlBank.getControl (i).setIndication (isBankUser);
		device.getMacro (i).getAmount ().setIndication (isBankMacro);
		push.groove.updateIndications (isGroove);
	}
			
	push.setButton (PUSH_BUTTON_MASTER, isMaster || isFrame ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_TRACK, isTrack ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_VOLUME, isVolume ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_PAN_SEND, mode >= MODE_PAN && mode <= MODE_SEND6 ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_DEVICE, isBankDevice || isBankMacro ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_SCALES, isScales ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_FIXED_LENGTH, isFixed ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_BROWSE, isPreset ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
}
