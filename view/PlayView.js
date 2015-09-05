// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function PlayView (model)
{
    if (model == null)
        return;
    
    AbstractView.call (this, model);

    this.scales = model.getScales ();
    this.noteMap = this.scales.getEmptyMatrix ();
    this.pressedKeys = initArray (0, 128);
    this.defaultVelocity = [];
    for (var i = 0; i < 128; i++)
        this.defaultVelocity.push (i);

    Config.addPropertyListener (Config.ACTIVATE_FIXED_ACCENT, doObject (this, function ()
    {
        this.initMaxVelocity ();
    }));
    Config.addPropertyListener (Config.FIXED_ACCENT_VALUE, doObject (this, function ()
    {
        this.initMaxVelocity ();
    }));
    
    var tb = model.getTrackBank ();
    tb.addNoteListener (doObject (this, function (pressed, note, velocity)
    {
        // Light notes send from the sequencer
        for (var i = 0; i < 128; i++)
        {
            if (this.noteMap[i] == note)
                this.pressedKeys[i] = pressed ? velocity : 0;
        }
    }));
    tb.addTrackSelectionListener (doObject (this, function (index, isSelected)
    {
        this.clearPressedKeys ();
    }));

    this.scrollerInterval = Config.trackScrollInterval;
}
PlayView.prototype = new AbstractView ();

PlayView.prototype.updateNoteMapping = function ()
{
    // Workaround: https://github.com/git-moss/Push4Bitwig/issues/7
    scheduleTask (doObject (this, PlayView.prototype.delayedUpdateNoteMapping), null, 100);
};

PlayView.prototype.onActivate = function ()
{
    AbstractView.prototype.onActivate.call (this);

    this.surface.setButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_HI);
    this.surface.setButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_ACCENT, Config.accentActive ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.model.getCurrentTrackBank ().setIndication (false);
    this.updateSceneButtons ();
    this.initMaxVelocity ();

    this.updateRibbonMode ();
};

PlayView.prototype.updateSceneButtons = function (buttonID)
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (PUSH_BUTTON_SCENE1 + i, PUSH_COLOR_BLACK);
};

PlayView.prototype.usesButton = function (buttonID)
{
    switch (buttonID)
    {
        case PUSH_BUTTON_REPEAT:
            return false;
    }
    return true;
};

PlayView.prototype.drawGrid = function ()
{
    var isKeyboardEnabled = this.canSelectedTrackHoldNotes ();
    var isRecording = this.model.hasRecordingState ();
    for (var i = 36; i < 100; i++)
    {
        this.surface.pads.light (i, isKeyboardEnabled ? (this.pressedKeys[i] > 0 ?
            (isRecording ? PUSH_COLOR2_RED_HI : PUSH_COLOR2_GREEN_HI) :
            this.scales.getColor (this.noteMap, i)) : PUSH_COLOR2_BLACK, null, false);
    }
};

PlayView.prototype.onGridNote = function (note, velocity)
{
    if (!this.canSelectedTrackHoldNotes () || this.noteMap[note] == -1)
        return;
    
    // Mark selected notes
    for (var i = 0; i < 128; i++)
    {
        if (this.noteMap[note] == this.noteMap[i])
            this.pressedKeys[i] = velocity;
    }
};

PlayView.prototype.onPolyAftertouch = function (note, value)
{
    switch (Config.convertAftertouch)
    {
        case -2:
            // Translate notes of Poly aftertouch to current note mapping
            this.surface.sendMidiEvent (0xA0, this.noteMap[note], value);
            break;
        
        case -1:
            // Convert to Channel Aftertouch
            this.surface.sendMidiEvent (0xD0, value, 0);
            break;
            
        default:
            // Midi CC
            this.surface.sendMidiEvent (0xB0, Config.convertAftertouch, value);
            break;
    }
};

PlayView.prototype.onOctaveDown = function (event)
{
    if (!event.isDown ())
        return;
    this.clearPressedKeys ();
    this.scales.decOctave ();
    this.updateNoteMapping ();
    this.surface.getDisplay ().showNotification ('        ' + this.scales.getRangeText ());
};

PlayView.prototype.onOctaveUp = function (event)
{
    if (!event.isDown ())
        return;
    this.clearPressedKeys ();
    this.scales.incOctave ();
    this.updateNoteMapping ();
    this.surface.getDisplay ().showNotification ('        ' + this.scales.getRangeText ());
};

PlayView.prototype.scrollUp = function (event)
{
    if (this.surface.isShiftPressed ())
        this.model.getApplication ().arrowKeyLeft ();
    else
        this.model.getApplication ().arrowKeyUp ();
};

PlayView.prototype.scrollDown = function (event)
{
    if (this.surface.isShiftPressed ())
        this.model.getApplication ().arrowKeyRight ();
    else
        this.model.getApplication ().arrowKeyDown ();
};

PlayView.prototype.initMaxVelocity = function ()
{
    this.maxVelocity = initArray (Config.fixedAccentValue, 128);
    this.maxVelocity[0] = 0;
    this.surface.setVelocityTranslationTable (Config.accentActive ? this.maxVelocity : this.defaultVelocity);
};

PlayView.prototype.clearPressedKeys = function ()
{
    for (var i = 0; i < 128; i++)
        this.pressedKeys[i] = 0;
};

PlayView.prototype.delayedUpdateNoteMapping = function ()
{
    this.noteMap = this.canSelectedTrackHoldNotes () ? this.scales.getNoteMatrix () : this.scales.getEmptyMatrix ();
    this.surface.setKeyTranslationTable (this.noteMap);
};
