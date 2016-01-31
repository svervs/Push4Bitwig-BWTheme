// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

var PUSH_BUTTON_TAP             = 3;
var PUSH_BUTTON_METRONOME       = 9;
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

//Push 2 specific
var PUSH_BUTTON_SETUP           = 30;
var PUSH_BUTTON_LAYOUT          = 31;
var PUSH_BUTTON_CONVERT         = 35;

var PUSH_BUTTON_SCENE1          = 36;    // 1/4
var PUSH_BUTTON_SCENE2          = 37;    
var PUSH_BUTTON_SCENE3          = 38;
var PUSH_BUTTON_SCENE4          = 39;
var PUSH_BUTTON_SCENE5          = 40;    // ...
var PUSH_BUTTON_SCENE6          = 41;
var PUSH_BUTTON_SCENE7          = 42;
var PUSH_BUTTON_SCENE8          = 43;    // 1/32T

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

var PUSH_BUTTON_STATE_OFF     = 0;
// Monochrome buttons
var PUSH_BUTTON_STATE_ON      = Config.isPush2 ? 8 : 1;
var PUSH_BUTTON_STATE_HI      = Config.isPush2 ? 127 : 4;
// Color buttons
var PUSH_BUTTON_STATE_REC_ON  = Config.isPush2 ? PUSH_COLOR2_GREY_LO : 1; 
var PUSH_BUTTON_STATE_REC_HI  = Config.isPush2 ? PUSH_COLOR2_RED_HI : 4;
var PUSH_BUTTON_STATE_PLAY_ON = Config.isPush2 ? PUSH_COLOR2_GREY_LO : 1; 
var PUSH_BUTTON_STATE_PLAY_HI = Config.isPush2 ? PUSH_COLOR2_GREEN_HI : 4;
var PUSH_BUTTON_STATE_MUTE_ON = Config.isPush2 ? PUSH_COLOR2_GREY_LO : 1; 
var PUSH_BUTTON_STATE_MUTE_HI = Config.isPush2 ? PUSH_COLOR2_AMBER_LO : 4;
var PUSH_BUTTON_STATE_SOLO_ON = Config.isPush2 ? PUSH_COLOR2_GREY_LO : 1; 
var PUSH_BUTTON_STATE_SOLO_HI = Config.isPush2 ? PUSH_COLOR2_YELLOW : 4;
var PUSH_BUTTON_STATE_STOP_ON = Config.isPush2 ? PUSH_COLOR2_RED_LO : 1; 
var PUSH_BUTTON_STATE_STOP_HI = Config.isPush2 ? PUSH_COLOR2_RED_HI : 4;

var PUSH_BUTTONS_ALL =
[
    PUSH_BUTTON_TAP,
    PUSH_BUTTON_METRONOME,
    PUSH_BUTTON_MASTER,
    PUSH_BUTTON_STOP,
    PUSH_BUTTON_LEFT,
    PUSH_BUTTON_RIGHT,
    PUSH_BUTTON_UP,
    PUSH_BUTTON_DOWN,
    PUSH_BUTTON_SELECT,
    PUSH_BUTTON_SHIFT,
    PUSH_BUTTON_NOTE,
    PUSH_BUTTON_SESSION,
    PUSH_BUTTON_ADD_EFFECT,
    PUSH_BUTTON_ADD_TRACK,
    PUSH_BUTTON_OCTAVE_DOWN,
    PUSH_BUTTON_OCTAVE_UP,
    PUSH_BUTTON_REPEAT,
    PUSH_BUTTON_ACCENT,
    PUSH_BUTTON_SCALES,
    PUSH_BUTTON_USER_MODE,
    PUSH_BUTTON_MUTE,
    PUSH_BUTTON_SOLO,
    PUSH_BUTTON_DEVICE_LEFT,
    PUSH_BUTTON_DEVICE_RIGHT,
    PUSH_BUTTON_PLAY,
    PUSH_BUTTON_RECORD,
    PUSH_BUTTON_NEW,
    PUSH_BUTTON_DUPLICATE,
    PUSH_BUTTON_AUTOMATION,
    PUSH_BUTTON_FIXED_LENGTH,
    PUSH_BUTTON_DEVICE,
    PUSH_BUTTON_BROWSE,
    PUSH_BUTTON_TRACK,
    PUSH_BUTTON_CLIP,
    PUSH_BUTTON_VOLUME,
    PUSH_BUTTON_PAN_SEND,
    PUSH_BUTTON_QUANTIZE,
    PUSH_BUTTON_DOUBLE,
    PUSH_BUTTON_DELETE,
    PUSH_BUTTON_UNDO,
    PUSH_BUTTON_SETUP,
    PUSH_BUTTON_LAYOUT,
    PUSH_BUTTON_CONVERT
];

var PUSH_BUTTON_UPDATE = initArray (true, 127);
PUSH_BUTTON_UPDATE[PUSH_BUTTON_SETUP]        = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_MUTE]         = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_SOLO]         = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_ACCENT]       = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_METRONOME]    = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_PLAY]         = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_RECORD]       = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_STOP]         = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_AUTOMATION]   = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_CONVERT]      = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_MASTER]       = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_TRACK]        = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_VOLUME]       = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_PAN_SEND]     = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_DEVICE]       = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_SCALES]       = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_FIXED_LENGTH] = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_BROWSE]       = false;
PUSH_BUTTON_UPDATE[PUSH_BUTTON_CLIP]         = false;


var PUSH_RIBBON_PITCHBEND = 0;
var PUSH_RIBBON_VOLUME    = 1;
var PUSH_RIBBON_PAN       = 2;
var PUSH_RIBBON_DISCRETE  = 3;

var PUSH_PAD_CURVES_NAME =
[
    'Linear',
    'Log 1 (Default)',
    'Log 2',
    'Log 3',
    'Log 4',
    'Log 5'
];

var PUSH_PAD_CURVES_DATA =
[
    '00 00 00 01 08 06 0A 00 00 00 00 00 0A 0F 0C 08 00 00 00 00 00 00 00 00',
    '00 00 00 01 04 0C 00 08 00 00 00 01 0D 04 0C 00 00 00 00 00 0E 0A 06 00',
    '00 00 00 01 04 0C 00 08 00 00 00 01 0D 04 0C 00 00 00 00 00 0C 03 05 00',
    '00 00 00 01 08 06 0A 00 00 00 00 01 0D 04 0C 00 00 00 00 00 0C 03 05 00',
    '00 00 00 01 0F 0B 0D 00 00 00 00 01 0D 04 0C 00 00 00 00 00 0C 03 05 00',
    '00 00 00 02 02 02 0E 00 00 00 00 01 0D 04 0C 00 00 00 00 00 00 00 00 00'
];

var PUSH_PAD_THRESHOLDS_NAME =
[
    '-20',
    '-19',
    '-18',
    '-17',
    '-16',
    '-15',
    '-14',
    '-13',
    '-12',
    '-11',
    '-10',
    '-9',
    '-8',
    '-7',
    '-6',
    '-5',
    '-4',
    '-3',
    '-2',
    '-1',
    '0 (Default)',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
];

var PUSH_PAD_THRESHOLDS_DATA =
[
    // 4 Byte: peak_sampling_time, 4 Byte: aftertouch_gate_time
    '00 00 00 0A 00 00 00 0A', 
    '00 00 01 03 00 00 01 04',
    '00 00 01 0C 00 00 01 0E',
    '00 00 02 05 00 00 02 08',
    '00 00 02 0E 00 00 03 02',
    '00 00 03 07 00 00 03 0C',
    '00 00 04 00 00 00 04 06',
    '00 00 04 09 00 00 05 00',
    '00 00 05 02 00 00 05 0A',
    '00 00 05 0B 00 00 06 04',
    '00 00 06 04 00 00 06 0E',
    '00 00 06 0D 00 00 07 08',
    '00 00 07 06 00 00 08 02',
    '00 00 07 0F 00 00 08 0C',
    '00 00 08 08 00 00 09 06',
    '00 00 09 01 00 00 0A 00',
    '00 00 09 0A 00 00 0A 0A',
    '00 00 0A 03 00 00 0B 04',
    '00 00 0A 0C 00 00 0B 0E',
    '00 00 0B 05 00 00 0C 08',
    '00 00 0B 0E 00 00 0D 02',
    '00 00 0C 07 00 00 0D 0C',
    '00 00 0D 00 00 00 0E 06',
    '00 00 0D 08 00 00 0E 0F',
    '00 00 0E 02 00 00 0F 0A',
    '00 00 0E 0B 00 01 00 04',
    '00 00 0F 04 00 01 00 0E',
    '00 00 0F 0D 00 01 01 08',
    '00 01 00 06 00 01 02 02',
    '00 01 00 0F 00 01 02 0C',
    '00 01 01 08 00 01 03 06',
    '00 01 02 01 00 01 04 00',
    '00 01 02 0A 00 01 04 0A',
    '00 01 03 03 00 01 05 04',
    '00 01 03 0C 00 01 05 0E',
    '00 01 04 05 00 01 06 08',
    '00 01 04 0E 00 01 07 02',
    '00 01 05 07 00 01 07 0C',
    '00 01 06 00 00 01 08 06',
    '00 01 06 09 00 01 09 00',
    '00 01 07 02 00 01 09 0A'
];

var PUSH_LOW_THRESHOLD_WARNING = '         Warning:Low threshold maycause stuck pads                  ';

Push.MAXW        = [ 1700, 1660, 1590, 1510, 1420, 1300, 1170, 1030,  860,  640,  400 ];
Push.PUSH2_CPMIN = [ 1650, 1580, 1500, 1410, 1320, 1220, 1110, 1000,  900,  800,  700 ];
Push.PUSH2_CPMAX = [ 2050, 1950, 1850, 1750, 1650, 1570, 1490, 1400, 1320, 1240, 1180 ];
Push.GAMMA       = [ 0.7, 0.64, 0.58, 0.54, 0.5, 0.46, 0.43, 0.4, 0.36, 0.32, 0.25 ];
Push.MINV        = [ 1, 1, 1, 1, 1, 1, 3, 6, 12, 24, 36 ];
Push.MAXV        = [ 96, 102, 116, 121, 124, 127, 127, 127, 127, 127, 127 ];
Push.ALPHA       = [ 90, 70, 54, 40, 28, 20, 10, -5, -25, -55, -90 ];

Push.PAD_VELOCITY_CURVE_CHUNK_SIZE = 16;
Push.NUM_VELOCITY_CURVE_ENTRIES    = 128;


function Push (output, input)
{
    AbstractControlSurface.call (this, output, input, PUSH_BUTTONS_ALL);
    
    for (var i = 36; i < 100; i++)
        this.gridNotes.push (i);
    
    this.selectButtonId = PUSH_BUTTON_SELECT;
    this.shiftButtonId  = PUSH_BUTTON_SHIFT;
    this.deleteButtonId = PUSH_BUTTON_DELETE;

    this.pads    = new Grid (output);
    this.display = new Display (output);
    
    this.showVU      = false;
    this.ribbonMode  = -1;
    this.ribbonValue = -1;
    
    this.majorVersion  = -1;
    this.minorVersion  = -1;
    this.buildNumber   = -1;
    this.serialNumber  = -1;
    this.boardRevision = -1;

    this.input.setSysexCallback (doObject (this, this.handleSysEx));
}
Push.prototype = new AbstractControlSurface ();

Push.prototype.sendIdentityRequest = function ()
{
    this.output.sendSysex ("F0 7E 7F 06 01 F7");
};

Push.prototype.getSelectedPadThreshold = function ()
{
    return PUSH_PAD_THRESHOLDS_NAME[Config.padThreshold];
};

Push.prototype.getSelectedVelocityCurve = function ()
{
    return PUSH_PAD_CURVES_NAME[Config.velocityCurve];
};

Push.prototype.shutdown = function ()
{
    // Clear display
    if (Config.isPush2)
    {
        // Push 2: Shutdown Push2Display app
        this.display.shutdown ();
    }
    else
        this.display.clear ().allDone().flush();

    // Turn off all buttons
    for (var i = 0; i < this.buttons.length; i++)
        this.setButton (this.buttons[i], PUSH_BUTTON_STATE_OFF);

    // Turn off 1st/2nd row buttons
    for (var i = 20; i < 28; i++)
        this.setButton (i, PUSH_BUTTON_STATE_OFF);
    for (var i = 102; i < 110; i++)
        this.setButton (i, PUSH_BUTTON_STATE_OFF);

    this.pads.turnOff ();
};

// Note: Weird to send to the DAW via Push...
Push.prototype.sendMidiEvent = function (status, data1, data2)
{
    this.noteInput.sendRawMidiEvent (status, data1, data2);
};


//--------------------------------------
// ViewState
//--------------------------------------

Push.prototype.updateButtons = function ()
{
    var view = this.getActiveView ();
    for (var i = 0; i < this.buttons.length; i++)
    {
        if (PUSH_BUTTON_UPDATE[this.buttons[i]])
            this.setButton (this.buttons[i], view.usesButton (this.buttons[i]) ? PUSH_BUTTON_STATE_ON : PUSH_BUTTON_STATE_OFF);
    }
};

//--------------------------------------
// Display
//--------------------------------------

Push.prototype.setButton = function (button, state)
{
    this.output.sendCC (button, state);
};

Push.prototype.toggleVU = function ()
{
    this.showVU = !this.showVU;
};

Push.prototype.setRibbonMode = function (mode)
{
    if (this.ribbonMode == mode)
        return;
    this.ribbonMode = mode;
    this.output.sendSysex ("F0 47 7F 15 63 00 01 0" + mode + " F7");
};

Push.prototype.setRibbonValue = function (value)
{
    if (this.ribbonValue == value)
        return;
    this.ribbonValue = value;
    this.output.sendPitchbend (0, value);
};

//--------------------------------------
// Push 1
//--------------------------------------

Push.prototype.sendPadSensitivity = function ()
{
    this.output.sendSysex ("F0 47 7F 15 5D 00 20 " + PUSH_PAD_THRESHOLDS_DATA[Config.padThreshold] + " " + PUSH_PAD_CURVES_DATA[Config.velocityCurve] + " F7");
};

//--------------------------------------
// Push 2
//--------------------------------------

Push.prototype.sendPadVelocityCurve = function ()
{
    var velocities = this.generateVelocityCurve (Config.padSensitivity, Config.padGain, Config.padDynamics);
    for (var index = 0; index < velocities.length; index += Push.PAD_VELOCITY_CURVE_CHUNK_SIZE)
    {
        var args = new Array ();
        args.push (32);
        args.push (index);
        for (var i = 0; i < Push.PAD_VELOCITY_CURVE_CHUNK_SIZE; i++)
            args.push (velocities[index + i]);
        this.sendPush2SysEx (args);    
    }    
};

Push.prototype.generateVelocityCurve = function (sensitivity, gain, dynamics)
{
    var minw = 160;
    var maxw = Push.MAXW[sensitivity];
    var minv = Push.MINV[gain];
    var maxv = Push.MAXV[gain];
    var result = this.calculatePoints (Push.ALPHA[dynamics]);
    var p1x = result[0];
    var p1y = result[1];
    var p2x = result[2];
    var p2y = result[3];
    var curve = [];
    var minwIndex = minw / 32;
    var maxwIndex = maxw / 32;
    var t = 0.0;
    
    var w;
    for (var index = 0; index < Push.NUM_VELOCITY_CURVE_ENTRIES; index++)
    {
        w = index * 32.0;
        if (w <= minw)
            velocity = 1.0 + (minv - 1.0) * index / minwIndex;
        else if (w >= maxw)
            velocity = maxv + (127.0 - maxv) * (index - maxwIndex) / (128 - maxwIndex);
        else
        {
            wnorm = (w - minw) / (maxw - minw);
            var bez = this.bezier(wnorm, t, p1x, p1y, p2x, p2y);
            b = bez[0]; 
            t = bez[1];
            velonorm = this.gammaFunc (b, Push.GAMMA[gain]);
            velocity = minv + velonorm * (maxv - minv);
        }
        curve.push (Math.min (Math.max (Math.floor (Math.round (velocity)), 1), 127));
    }
    return curve;
};

Push.prototype.bezier = function (x, t, p1x, p1y, p2x, p2y)
{
    var p0x = 0.0;
    var p0y = 0.0;
    var p3x = 1.0;
    var p3y = 1.0;
    var s;
    var t2;
    var t3;
    var s2;
    var s3;
    var xt;
    while (t <= 1.0)
    {
        s = 1 - t;
        t2 = t * t;
        t3 = t2 * t;
        s2 = s * s;
        s3 = s2 * s;
        xt = s3 * p0x + 3 * t * s2 * p1x + 3 * t2 * s * p2x + t3 * p3x;
        if (xt >= x)
            return [ s3 * p0y + 3 * t * s2 * p1y + 3 * t2 * s * p2y + t3 * p3y, t ];
        t += 0.0001;
    }
    return [ 1.0, t ];
};

Push.prototype.calculatePoints = function (alpha)
{
    var a1 = (225.0 - alpha) * Math.PI / 180.0;
    var a2 = (45.0 - alpha) * Math.PI / 180.0;
    var r = 0.4;
    return [ 0.5 + r * Math.cos(a1), 0.5 + r * Math.sin(a1), 0.5 + r * Math.cos(a2), 0.5 + r * Math.sin(a2) ];
};

Push.prototype.gammaFunc = function (x, gamma)
{
    return Math.pow (x, Math.exp (-4.0 + 8.0 * gamma));
};

Push.prototype.sendPadThreshold = function ()
{
    var args = new Array ();
    args.push (27);
    this.add7L5M (args, 33);                            // threshold0
    this.add7L5M (args, 31);                            // threshold1
    this.add7L5M (args, Push.PUSH2_CPMIN[Config.padSensitivity]); // cpmin
    this.add7L5M (args, Push.PUSH2_CPMAX[Config.padSensitivity]); // cpmax
    this.sendPush2SysEx (args);    
};

Push.prototype.add7L5M = function (array, value)
{
    array.push (value & 127);
    array.push (value >> 7 & 31);
};


Push.prototype.sendDisplayBrightness = function ()
{
    var brightness = Math.round (Config.displayBrightness * 255 / 100);
    this.sendPush2SysEx ([ 8, brightness & 127, brightness >> 7 & 1 ]);
};

Push.prototype.sendLEDBrightness = function ()
{
    var brightness = Math.round (Config.ledBrightness * 127 / 100);
    this.sendPush2SysEx ([ 6, brightness ]);
};

Push.prototype.sendPush2SysEx = function (parameters)
{
    this.output.sendSysex ("F0 00 21 1D 01 01 " + toHexStr (parameters) + "F7");
};

//--------------------------------------
// Handlers
//--------------------------------------

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
        case PUSH_BUTTON_METRONOME:
            view.onMetronome (event);
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
        case 36:    // 1/4
        case 37:    
        case 38:
        case 39:
        case 40:    // ...
        case 41:
        case 42:
        case 43:    // 1/32T
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
            view.onAddEffect (event);
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
            
        // Layout - Push 2
        case PUSH_BUTTON_LAYOUT:
            view.onLayout (event);
            break;
           
		// Setup - Push 2 
        case PUSH_BUTTON_SETUP:
            if (Config.isPush2)
                view.onSetup (event);
            break;
            
		// Convert - Push 2 
        case PUSH_BUTTON_CONVERT:
            if (Config.isPush2)
                view.onConvert (event);
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
            view.onSmallKnob2Touch (value == 127);
            break;
    }
};

Push.prototype.handleSysEx = function (data)
{
    if (Config.isPush2)
    {
        PUSH2_IDENTITY_MIN_LENGTH = 21;
        PUSH2_ID = [ 0xF0, 0x7E, 0x01, 0x06, 0x02, 0x00 ];
        
        var byteLength = data.length / 2;
        if (byteLength < PUSH2_IDENTITY_MIN_LENGTH)
        {
            println ("Wrong identifier length: " + byteLength);
            return;
        }
    
        for (var i = 0; i < PUSH2_ID.length; i++)
        {
            var value = data.hexByteAt (i);
            if (value != PUSH2_ID[i])
            {
                println ("Wrong identifier value at index " + i + ": " + value +" : "+ PUSH2_ID[i]);
                return;
            }
        }
        
        this.majorVersion = data.hexByteAt (12);
        this.minorVersion = data.hexByteAt (13);
        this.buildNumber = data.hexByteAt (14) + (data.hexByteAt (15) << 7);
        this.serialNumber = data.hexByteAt (16) + (data.hexByteAt (17) << 7) + (data.hexByteAt (18) << 14) + (data.hexByteAt (19) << 21) + (data.hexByteAt (20) << 28);
        this.boardRevision = byteLength > 21 ? data.hexByteAt (21) : 0;
    }
    else
    {
        PUSH1_IDENTITY_MIN_LENGTH = 35;
        PUSH1_ID = [ 0xF0, 0x7E, 0x00, 0x06, 0x02, 0x47, 0x15 ];
        
        var byteLength = data.length / 2;
        if (byteLength < PUSH1_IDENTITY_MIN_LENGTH)
        {
            println ("Wrong identifier length: " + byteLength);
            return;
        }
    
        for (var i = 0; i < PUSH1_ID.length; i++)
        {
            var value = data.hexByteAt (i);
            if (value != PUSH1_ID[i])
            {
                println ("Wrong identifier value at index " + i + ": " + value +" : "+ PUSH1_ID[i]);
                return;
            }
        }
        
        this.majorVersion  = data.hexByteAt (10);
        this.minorVersion  = data.hexByteAt (12) + data.hexByteAt (11) * 10;
        this.buildNumber   = 0;
        this.serialNumber  = 0;
        this.boardRevision = 0;        
    }
};
