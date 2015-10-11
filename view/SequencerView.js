// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

SequencerView.NUM_DISPLAY_ROWS = 7;
SequencerView.NUM_DISPLAY_COLS = 8;
SequencerView.NUM_OCTAVE       = 12;
SequencerView.START_KEY        = 36;

function SequencerView (model)
{
    AbstractSequencerView.call (this, model, 128, SequencerView.NUM_DISPLAY_COLS);
    
    this.loopPadPressed = -1;
    this.offsetY = SequencerView.START_KEY;

    this.clip.scrollTo (0, SequencerView.START_KEY);   
}
SequencerView.prototype = new AbstractSequencerView ();

SequencerView.prototype.onActivate = function ()
{
    this.updateScale ();
    AbstractSequencerView.prototype.onActivate.call (this);
};

SequencerView.prototype.updateArrowStates = function ()
{
    this.canScrollUp = this.offsetY + SequencerView.NUM_OCTAVE <= this.clip.getRowSize () - SequencerView.NUM_OCTAVE;
    this.canScrollDown = this.offsetY - SequencerView.NUM_OCTAVE >= 0;
    this.canScrollLeft = this.offsetX > 0;
    this.canScrollRight = true; // TODO API extension required - We do not know the number of steps

    this.drawSceneButtons ();
};

SequencerView.prototype.updateScale = function ()
{
    this.noteMap = this.canSelectedTrackHoldNotes () ? this.scales.getSequencerMatrix (SequencerView.NUM_DISPLAY_ROWS, this.offsetY) : this.scales.getEmptyMatrix ();
};

SequencerView.prototype.usesButton = function (buttonID)
{
    switch (buttonID)
    {
        case PUSH_BUTTON_REPEAT:
            return false;
    }
    return true;
};

SequencerView.prototype.onGridNote = function (note, velocity)
{
    if (!this.canSelectedTrackHoldNotes ())
        return;
    var index = note - 36;
    var x = index % 8;
    var y = Math.floor (index / 8);

    if (y < 7)
    {
        if (velocity != 0)
            this.clip.toggleStep (x, this.noteMap[y], Config.accentActive ? Config.fixedAccentValue : velocity);
        return;
    }
        
    // Clip length/loop area
    var pad = x;
    if (velocity > 0)   // Button pressed
    {
        if (this.loopPadPressed == -1)  // Not yet a button pressed, store it
            this.loopPadPressed = pad;
    }
    else if (this.loopPadPressed != -1)
    {
        var start = this.loopPadPressed < pad ? this.loopPadPressed : pad;
        var end   = (this.loopPadPressed < pad ? pad : this.loopPadPressed) + 1;
        var quartersPerPad = this.model.getQuartersPerMeasure () / 2;
        
        // Set a new loop between the 2 selected pads
        var newStart = start * quartersPerPad;
        this.clip.setLoopStart (newStart);
        this.clip.setLoopLength ((end - start) * quartersPerPad);
        this.clip.setPlayRange (newStart, end * quartersPerPad);

        this.loopPadPressed = -1;
    }
};

SequencerView.prototype.onOctaveDown = function (event)
{
    if (event.isDown ())
        this.scrollDown (event);
};

SequencerView.prototype.onOctaveUp = function (event)
{
    if (event.isDown ())
        this.scrollUp (event);
};

SequencerView.prototype.scrollUp = function (event)
{
    this.updateOctave (Math.min (this.clip.getRowSize () - SequencerView.NUM_OCTAVE, this.offsetY + SequencerView.NUM_OCTAVE));
};

SequencerView.prototype.scrollDown = function (event)
{
    this.updateOctave (Math.max (0, this.offsetY - SequencerView.NUM_OCTAVE));
};

SequencerView.prototype.updateOctave = function (value)
{
    this.offsetY = value;
    this.updateScale ();
    this.surface.getDisplay ().showNotification ('          ' + this.scales.getSequencerRangeText (this.noteMap[0], this.noteMap[6]));
};

SequencerView.prototype.drawGrid = function ()
{
    // Also update the value of the ribbon
    this.updateRibbonMode ();
    
    var isKeyboardEnabled = this.canSelectedTrackHoldNotes ();
    var step = this.clip.getCurrentStep ();
    var hiStep = this.isInXRange (step) ? step % SequencerView.NUM_DISPLAY_COLS : -1;
    for (var x = 0; x < SequencerView.NUM_DISPLAY_COLS; x++)
    {
        for (var y = 0; y < SequencerView.NUM_DISPLAY_ROWS; y++)
        {
            var row = this.noteMap[y];
            var isSet = this.clip.getStep (x, row);
            var hilite = x == hiStep;
            if (isKeyboardEnabled)
                this.surface.pads.lightEx (x, 7 - y, isSet ? (hilite ? PUSH_COLOR2_GREEN_HI : PUSH_COLOR2_BLUE) : hilite ? PUSH_COLOR2_GREEN_HI : this.scales.getColor (this.noteMap, y), null, false);
            else
                this.surface.pads.lightEx (x, 7 - y, PUSH_COLOR2_BLACK, null, false);
        }
    }
    
    // Clip length/loop area
    var quartersPerPad = this.model.getQuartersPerMeasure () / 2;
    var stepsPerMeasure = Math.round (quartersPerPad / this.resolutions[this.selectedIndex]);
    var currentMeasure = Math.floor (step / stepsPerMeasure);
    var maxQuarters = quartersPerPad * 8;
    var start = this.clip.getLoopStart ();
    var loopStartPad = Math.floor (Math.max (0, start) / quartersPerPad);
    var loopEndPad   = Math.ceil (Math.min (maxQuarters, start + this.clip.getLoopLength ()) / quartersPerPad);
    for (var pad = 0; pad < 8; pad++)
    {
        if (isKeyboardEnabled)
            this.surface.pads.lightEx (pad, 0, pad >= loopStartPad && pad < loopEndPad ? (pad == currentMeasure ? PUSH_COLOR2_GREEN : PUSH_COLOR2_WHITE) : PUSH_COLOR_BLACK, null, false);
        else
            this.surface.pads.lightEx (pad, 0, PUSH_COLOR2_BLACK, null, false);
    }
};
