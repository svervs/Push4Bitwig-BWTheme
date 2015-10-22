// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function ClipView (model)
{
    AbstractSequencerView.call (this, model, 0, 0);

    if (model == null)
        return;
    
    this.loopPadPressed = -1;
    this.padResolutions = [ 1, 4, 16 ];
    this.padResolution = 0;
}
ClipView.prototype = new AbstractSequencerView ();

ClipView.prototype.updateArrowStates = function ()
{
    this.canScrollUp = false;
    this.canScrollDown = false;
    this.canScrollLeft = false;
    this.canScrollRight = false;
};

ClipView.prototype.updateNoteMapping = function ()
{
    this.noteMap = this.scales.getEmptyMatrix ();
    this.surface.setKeyTranslationTable (this.noteMap);
};

ClipView.prototype.usesButton = function (buttonID)
{
    switch (buttonID)
    {
        case PUSH_BUTTON_REPEAT:
        case PUSH_BUTTON_OCTAVE_DOWN:
        case PUSH_BUTTON_OCTAVE_UP:
            return false;
    }
    return true;
};

ClipView.prototype.onGridNote = function (note, velocity)
{
    var index = note - 36;
    var x = index % 8;
    var y = Math.floor (index / 8);

    // Clip length/loop area
    var pad = (7 - y) * 8 + x;
    if (velocity > 0)   // Button pressed
    {
        if (this.loopPadPressed == -1)  // Not yet a button pressed, store it
            this.loopPadPressed = pad;
    }
    else if (this.loopPadPressed != -1)
    {
        var start = this.loopPadPressed < pad ? this.loopPadPressed : pad;
        var end   = (this.loopPadPressed < pad ? pad : this.loopPadPressed) + 1;
        var quartersPerPad = this.getQuartersPerPad ();
        
        // Set a new loop between the 2 selected pads
        var newStart = start * quartersPerPad;
        this.clip.setLoopStart (newStart);
        this.clip.setLoopLength ((end - start) * quartersPerPad);
        this.clip.setPlayRange (newStart, end * quartersPerPad);

        this.loopPadPressed = -1;
    }
};

ClipView.prototype.drawGrid = function ()
{
    // Also update the value of the ribbon
    this.updateRibbonMode ();
    
    // Clip length/loop area
    var step = this.clip.getCurrentStep ();
    var quartersPerPad = this.getQuartersPerPad ();
    var stepsPerMeasure = Math.round (quartersPerPad / this.resolutions[this.selectedIndex]);
    var currentMeasure = Math.floor (step / stepsPerMeasure);
    var maxQuarters = quartersPerPad * 64;
    var start = this.clip.getLoopStart ();
    var loopStartPad = Math.floor (Math.max (0, start) / quartersPerPad);
    var loopEndPad   = Math.ceil (Math.min (maxQuarters, start + this.clip.getLoopLength ()) / quartersPerPad);
    for (var pad = 0; pad < 64; pad++)
        this.surface.pads.lightEx (pad % 8, Math.floor (pad / 8), pad >= loopStartPad && pad < loopEndPad ? (pad == currentMeasure ? PUSH_COLOR2_GREEN : PUSH_COLOR2_WHITE) : PUSH_COLOR_BLACK, null, false);
};

ClipView.prototype.onScene = function (index)
{
    if (7 - index > 3)
        return;

    this.padResolution = 7 - index;
    this.drawSceneButtons ();
};

ClipView.prototype.drawSceneButtons = function ()
{
    for (var i = 0; i < 8; i++)
    {
        if (i < 3)
            this.surface.setButton (PUSH_BUTTON_SCENE1 + i, i == this.padResolution ? PUSH_COLOR_SCENE_YELLOW : PUSH_COLOR_SCENE_GREEN);
        else
            this.surface.setButton (PUSH_BUTTON_SCENE1 + i, PUSH_COLOR_BLACK);
    }
};

ClipView.prototype.getQuartersPerPad = function ()
{
    return this.model.getQuartersPerMeasure () / this.padResolutions[this.padResolution];
};

ClipView.prototype.scrollLeft = function (event) {};
ClipView.prototype.scrollRight = function (event) {};
