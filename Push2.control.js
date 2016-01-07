// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function Config () {}
Config.isPush2 = true;

loadAPI (1);
load ("Config.js");
load ("framework/ClassLoader.js");
load ("push/ClassLoader.js");
load ("view/ClassLoader.js");
load ("mode/ClassLoader.js");
load ("Controller.js");

// This is the only global variable, do not use it.
var controller = null;

host.defineController ("Ableton", "Push 2", "7.22", "B7621FC0-9223-11E5-A837-0800200C9A66", "Jürgen Moßgraber");
host.defineMidiPorts (1, 1);
host.platformIsWindows () && host.addDeviceNameBasedDiscoveryPair (["Ableton Push 2"], ["Ableton Push 2"]);
host.platformIsLinux () && host.addDeviceNameBasedDiscoveryPair (["Ableton Push 2 MIDI 1"], ["Ableton Push 2 MIDI 1"]);
host.platformIsMac () && host.addDeviceNameBasedDiscoveryPair (["Ableton Push 2 Live Port"], ["Ableton Push 2 Live Port"]);

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
