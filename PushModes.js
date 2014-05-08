// Written by Michael Schmalle
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

// Display Modes
var MODE_TRACK  = 0;
var MODE_VOLUME = 1;
var MODE_DEVICE = 2;
var MODE_MASTER = 3;
var MODE_PAN    = 4;
var MODE_SEND1  = 5;
var MODE_SEND2  = 6;
var MODE_SEND3  = 7;
var MODE_SEND4  = 8;
var MODE_SEND5  = 9;
var MODE_SEND6  = 10;
var MODE_SCALES = 11;
var MODE_MACRO  = 12;
var MODE_FIXED  = 13;
var MODE_PRESET = 14;
var MODE_FRAME  = 15;
var MODE_SEND  = 16; // TODO move this

load("mode/BaseMode.js");
load("mode/VolumeMode.js");
load("mode/PanMode.js");
load("mode/SendMode.js");
load("mode/TrackMode.js");
load("mode/DeviceMode.js");
load("mode/MacroMode.js");
load("mode/PresetMode.js");
load("mode/MasterMode.js");
load("mode/FrameMode.js");
load("mode/ScalesMode.js");
load("mode/FixedMode.js");
