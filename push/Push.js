// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
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

var PUSH_BUTTON_STATE_OFF = 0;
var PUSH_BUTTON_STATE_ON  = 1;
var PUSH_BUTTON_STATE_HI  = 4;

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
    PUSH_BUTTON_UNDO
];

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
    
    this.showVU = false;
    this.ribbonMode = -1;
    this.ribbonValue = -1;
}
Push.prototype = new AbstractControlSurface ();

Push.prototype.changePadThreshold = function (increase)
{
    if (increase)
        Config.setPadThreshold (Config.padThreshold + 1);
    else
        Config.setPadThreshold (Config.padThreshold - 1);
    this.sendPadSensitivity ();
};

Push.prototype.changeVelocityCurve = function (increase)
{
    if (increase)
        Config.setVelocityCurve (Config.velocityCurve + 1);
    else
        Config.setVelocityCurve (Config.velocityCurve - 1);
    this.sendPadSensitivity ();
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
    for (var i = 0; i < 4; i++)
        this.display.clearRow (i);

    // Turn off all buttons
    for (var i = 0; i < this.buttons.length; i++)
        this.setButton (this.buttons[i], PUSH_BUTTON_STATE_OFF);

    // Turn off 1st/2nd row buttons
    for (var i = 20; i < 27; i++)
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
        this.setButton (this.buttons[i], view.usesButton (this.buttons[i]) ? PUSH_BUTTON_STATE_ON : PUSH_BUTTON_STATE_OFF);
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

Push.prototype.sendPadSensitivity = function ()
{
    this.output.sendSysex ("F0 47 7F 15 5D 00 20 " + PUSH_PAD_THRESHOLDS_DATA[Config.padThreshold] + " " + PUSH_PAD_CURVES_DATA[Config.velocityCurve] + " F7");
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
