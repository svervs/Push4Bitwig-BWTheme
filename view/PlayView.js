// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function PlayView (model)
{
    AbstractView.call (this, model);

    this.scales = model.getScales ();
    this.noteMap = this.scales.getEmptyMatrix ();
    this.pressedKeys = initArray (0, 128);
    this.defaultVelocity = [];
    for (var i = 0; i < 128; i++)
        this.defaultVelocity.push (i);
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
    
    this.pitchValue = 0;
}
PlayView.prototype = new AbstractView ();

PlayView.prototype.updateNoteMapping = function ()
{
    var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
    this.noteMap = t != null && t.canHoldNotes ? this.scales.getNoteMatrix () : this.scales.getEmptyMatrix ();
    // Workaround: https://github.com/git-moss/Push4Bitwig/issues/7
    scheduleTask (doObject (this, function () { this.surface.setKeyTranslationTable (this.noteMap); }), null, 100);
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

PlayView.prototype.updateArrows = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    var isDevice = this.surface.getCurrentMode () == MODE_BANK_DEVICE || this.surface.getCurrentMode () == MODE_PRESET;
    var sel = tb.getSelectedTrack ();
    // var cd = this.model.getCursorDevice ();
    this.canScrollLeft = isDevice ? true /* TODO: Bitwig bug cd.canSelectPreviousFX () */ : sel != null && sel.index > 0 || tb.canScrollTracksUp ();
    this.canScrollRight = isDevice ? true /* TODO: Bitwig bug cd.canSelectNextFX () */ : sel != null && sel.index < 7 || tb.canScrollTracksDown ();

    AbstractView.prototype.updateArrows.call (this);
};

PlayView.prototype.onPitchbend = function (data1, data2)
{
    if (this.surface.isShiftPressed ())
    {
        if (this.surface.getCurrentMode () != MODE_RIBBON)
            this.surface.setPendingMode (MODE_RIBBON);
        return;
    }

    switch (Config.ribbonMode)
    {
        case Config.RIBBON_MODE_PITCH:
            this.surface.sendMidiEvent (0xE0, data1, data2);
            break;

        case Config.RIBBON_MODE_CC:
            if (data2 == 64)    // Overwrite automatic recentering on release
                data2 = 0;
            this.surface.sendMidiEvent (0xB0, Config.ribbonModeCCVal, data2);
            break;

        case Config.RIBBON_MODE_MIXED:
            if (data2 > 64)
                this.surface.sendMidiEvent (0xE0, data1, data2);
            else if (data2 < 64)
                this.surface.sendMidiEvent (0xB0, Config.ribbonModeCCVal, 127 - data2 * 2);
            else
            {
                this.surface.sendMidiEvent (0xE0, data1, data2);
                this.surface.sendMidiEvent (0xB0, Config.ribbonModeCCVal, 0);
            }
            break;
    }

    this.pitchValue = data2;
    this.surface.output.sendPitchbend (data1, data2);
};

PlayView.prototype.updateRibbonMode = function ()
{
    switch (Config.ribbonMode)
    {
        case Config.RIBBON_MODE_PITCH:
        case Config.RIBBON_MODE_MIXED:
            this.surface.setRibbonMode (PUSH_RIBBON_PITCHBEND);
            this.surface.output.sendPitchbend (0, 64);
            break;
        case Config.RIBBON_MODE_CC:
            this.surface.setRibbonMode (PUSH_RIBBON_VOLUME);
            this.surface.output.sendPitchbend (0, this.pitchValue);
            break;
    }
};

PlayView.prototype.usesButton = function (buttonID)
{
    switch (buttonID)
    {
        case PUSH_BUTTON_REPEAT:
        case PUSH_BUTTON_SELECT:
        case PUSH_BUTTON_ADD_EFFECT:
        case PUSH_BUTTON_USER_MODE:
        case PUSH_BUTTON_DUPLICATE:
        case PUSH_BUTTON_CLIP:
            return false;
    }
    return true;
};

PlayView.prototype.drawGrid = function ()
{
    var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
    var isKeyboardEnabled = t != null && t.canHoldNotes;
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
    var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
    if (t == null || !t.canHoldNotes)
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
    // Translate to current note mapping
    this.surface.sendMidiEvent (0xA0, this.noteMap[note], value);
};

PlayView.prototype.onOctaveDown = function (event)
{
    if (!event.isDown ())
        return;
    this.clearPressedKeys ();
    this.scales.decOctave ();
    this.updateNoteMapping ();
    this.surface.getDisplay ().showNotification ('       ' + this.scales.getRangeText ());
};

PlayView.prototype.onOctaveUp = function (event)
{
    if (!event.isDown ())
        return;
    this.clearPressedKeys ();
    this.scales.incOctave ();
    this.updateNoteMapping ();
    this.surface.getDisplay ().showNotification ('       ' + this.scales.getRangeText ());
};

PlayView.prototype.onAccent = function (event)
{
    AbstractView.prototype.onAccent.call (this, event);
    if (event.isUp ())
        this.initMaxVelocity ();
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

PlayView.prototype.scrollLeft = function (event)
{
    if (this.surface.getCurrentMode () == MODE_BANK_DEVICE || this.surface.getCurrentMode () == MODE_PRESET)
        this.model.getCursorDevice ().selectPrevious ();
    else
    {
        var tb = this.model.getCurrentTrackBank ();
        var sel = tb.getSelectedTrack ();
        var index = sel == null ? 0 : sel.index - 1;
        if (index == -1)
        {
            if (!tb.canScrollTracksUp ())
                return;
            tb.scrollTracksPageUp ();
            scheduleTask (doObject (this, this.selectTrack), [7], 75);
            return;
        }
        this.selectTrack (index);
    }
};

PlayView.prototype.scrollRight = function (event)
{
    if (this.surface.getCurrentMode () == MODE_BANK_DEVICE || this.surface.getCurrentMode () == MODE_PRESET)
        this.model.getCursorDevice ().selectNext ();
    else
    {
        var tb = this.model.getCurrentTrackBank ();
        var sel = tb.getSelectedTrack ();
        var index = sel == null ? 0 : sel.index + 1;
        if (index == 8)
        {
            if (!tb.canScrollTracksDown ())
                return;
            tb.scrollTracksPageDown ();
            scheduleTask (doObject (this, this.selectTrack), [0], 75);
        }
        this.selectTrack (index);
    }
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
