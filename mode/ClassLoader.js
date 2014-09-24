// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

// Display Modes
var MODE_TRACK               = 0;
var MODE_VOLUME              = 1;
var MODE_MASTER              = 2;
var MODE_FRAME               = 3;
var MODE_GROOVE              = 4;
var MODE_ACCENT              = 5;
var MODE_CROSSFADER          = 6;

var MODE_PAN                 = 10;
var MODE_SEND1               = 11;
var MODE_SEND2               = 12;
var MODE_SEND3               = 13;
var MODE_SEND4               = 14;
var MODE_SEND5               = 15;
var MODE_SEND6               = 16;
var MODE_SEND                = 17;

var MODE_PARAM_PAGE_SELECT   = 20;
var MODE_BANK_DEVICE         = 21;
var MODE_BANK_COMMON         = 22;
var MODE_BANK_ENVELOPE       = 23;
var MODE_BANK_MODULATE       = 24;
var MODE_BANK_USER           = 25;
var MODE_BANK_MACRO          = 26;
var MODE_PRESET              = 27;

var MODE_SCALES              = 30;
var MODE_FIXED               = 31;
var MODE_SCALE_LAYOUT        = 32;
var MODE_RIBBON              = 33;

var MODE_MASTER_TEMP         = 100;

load ("BaseMode.js");
load ("AbstractTrackMode.js");
load ("TrackMode.js");
load ("VolumeMode.js");
load ("MasterMode.js");
load ("FrameMode.js");
load ("GrooveMode.js");
load ("AccentMode.js");
load ("CrossfaderMode.js");

load ("PanMode.js");
load ("SendMode.js");

load ("ParamPageSelectMode.js");
load ("DeviceMode.js");
load ("ParamPageMode.js");
load ("PresetMode.js");

load ("ScalesMode.js");
load ("ScaleLayoutMode.js");
load ("FixedMode.js");
load ("RibbonMode.js");
