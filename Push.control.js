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

// This is the only global variable, do not use it.
var push = null;

host.defineController ("Ableton", "Push", "2.51", "D69AFBF0-B71E-11E3-A5E2-0800200C9A66");
host.defineMidiPorts (1, 1);
host.addDeviceNameBasedDiscoveryPair (["MIDIIN2 (Ableton Push)"], ["MIDIOUT2 (Ableton Push)"]);
host.addDeviceNameBasedDiscoveryPair (["Ableton Push MIDI 2"], ["Ableton Push MIDI 2"]);

function init()
{
	var output = new MidiOutput ();
	var input = new MidiInput ();

	push = new Push (output, input);
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
