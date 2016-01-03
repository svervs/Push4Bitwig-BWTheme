// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

// Display Modes
var MODE_TRACK               = 0;
var MODE_VOLUME              = 1;
var MODE_MASTER              = 2;
var MODE_FRAME               = 3;
var MODE_GROOVE              = 4;
var MODE_ACCENT              = 5;
var MODE_CROSSFADER          = 6;
var MODE_CLIP                = 7;

var MODE_PAN                 = 10;
var MODE_SEND1               = 11;
var MODE_SEND2               = 12;
var MODE_SEND3               = 13;
var MODE_SEND4               = 14;
var MODE_SEND5               = 15;
var MODE_SEND6               = 16;
var MODE_SEND7               = 17;
var MODE_SEND8               = 18;
var MODE_SEND                = 19;

var MODE_DEVICE_PARAMS       = 20;
var MODE_DEVICE_COMMON       = 21;
var MODE_DEVICE_ENVELOPE     = 22;
var MODE_DEVICE_MODULATE     = 23;
var MODE_DEVICE_USER         = 24;
var MODE_DEVICE_MACRO        = 25;
var MODE_DEVICE_DIRECT       = 26;

var MODE_DEVICE_MODE_SELECT  = 27;
var MODE_DEVICE_LAYER        = 28;
var MODE_DEVICE_PRESETS      = 29;

var MODE_SCALES              = 30;
var MODE_FIXED               = 31;
var MODE_SCALE_LAYOUT        = 32;
var MODE_RIBBON              = 33;
var MODE_VIEW_SELECT         = 34;
var MODE_AUTOMATION          = 35;
var MODE_TRANSPORT           = 36;
var MODE_CONFIGURATION       = 37;
var MODE_SETUP               = 38;
var MODE_INFO                = 39;

var MODE_DEVICE_LAYER_VOLUME = 40;
var MODE_DEVICE_LAYER_PAN    = 41;
var MODE_DEVICE_LAYER_SEND1  = 42;
var MODE_DEVICE_LAYER_SEND2  = 43;
var MODE_DEVICE_LAYER_SEND3  = 44;
var MODE_DEVICE_LAYER_SEND4  = 45;
var MODE_DEVICE_LAYER_SEND5  = 46;
var MODE_DEVICE_LAYER_SEND6  = 47;
var MODE_DEVICE_LAYER_SEND7  = 48;
var MODE_DEVICE_LAYER_SEND8  = 49;
var MODE_DEVICE_LAYER_SEND   = 50;

var MODE_MASTER_TEMP         = 100;

var DEVICE_MODES = [ MODE_DEVICE_PARAMS, MODE_DEVICE_COMMON, MODE_DEVICE_ENVELOPE, MODE_DEVICE_MODULATE, MODE_DEVICE_USER, MODE_DEVICE_MACRO, MODE_DEVICE_DIRECT ];
var TRACK_MODES  = [ MODE_TRACK, MODE_VOLUME, MODE_PAN, MODE_CROSSFADER, MODE_SEND1, MODE_SEND2, MODE_SEND3, MODE_SEND4, MODE_SEND5, MODE_SEND6, MODE_SEND7, MODE_SEND8, MODE_CLIP ];

function isTrackMode (mode)
{
    for (var i = 0; i < TRACK_MODES.length; i++)
        if (TRACK_MODES[i] == mode)
            return true;
    return false;
}

load ("BaseMode.js");

load ("AccentMode.js");
load ("AutomationMode.js");
load ("FixedMode.js");
load ("FrameMode.js");
load ("GrooveMode.js");
load ("RibbonMode.js");
load ("ScalesMode.js");
load ("ScaleLayoutMode.js");
load ("ViewSelectMode.js");
load ("TransportMode.js");

if (Config.isPush2)
{
    load ("SetupMode.js");
    load ("InfoMode.js");
}
else
    load ("ConfigurationMode.js");

load ("track/AbstractTrackMode.js");
load ("track/ClipMode.js");
load ("track/CrossfaderMode.js");
load ("track/MasterMode.js");
load ("track/PanMode.js");
load ("track/SendMode.js");
load ("track/TrackMode.js");
load ("track/VolumeMode.js");

load ("device/AbstractDeviceMode.js");
load ("device/AbstractDeviceFixedMode.js");
load ("device/DeviceCommonMode.js");
load ("device/DeviceDirectMode.js");
load ("device/DeviceEnvelopeMode.js");
load ("device/DeviceMacroMode.js");
load ("device/DeviceModulationMode.js");
load ("device/DeviceParamsMode.js");
load ("device/DeviceUserMode.js");

load ("device/DeviceModeSelectMode.js");
load ("device/DeviceLayerMode.js");
load ("device/DeviceLayerModeVolume.js");
load ("device/DeviceLayerModePan.js");
load ("device/DeviceLayerModeSend.js");
load ("device/DevicePresetsMode.js");
