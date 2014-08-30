// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

loadAPI (1);
load ("Config.js");
load ("framework/ClassLoader.js");
load ("push/ClassLoader.js");
load ("view/ClassLoader.js");
load ("mode/ClassLoader.js");
load ("Controller.js");

// This is the only global variable, do not use it.
var controller = null;

host.defineController ("Ableton", "Push", "3.21", "D69AFBF0-B71E-11E3-A5E2-0800200C9A66");
host.defineMidiPorts (1, 1);
host.platformIsWindows () && host.addDeviceNameBasedDiscoveryPair (["MIDIIN2 (Ableton Push)"], ["MIDIOUT2 (Ableton Push)"]);
host.platformIsLinux () && host.addDeviceNameBasedDiscoveryPair (["Ableton Push MIDI 2"], ["Ableton Push MIDI 2"]);
host.platformIsMac () && host.addDeviceNameBasedDiscoveryPair (["Ableton Push User Port"], ["Ableton Push User Port"]);

function init ()
{
    controller = new Controller ();
    println ("Initialized.");
}

function exit ()
{
    controller.shutdown ();
}

function flush ()
{
    controller.flush ();
}
