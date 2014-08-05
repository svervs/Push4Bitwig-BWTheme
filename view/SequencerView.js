// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

SequencerView.NUM_DISPLAY_ROWS = 8;
SequencerView.NUM_DISPLAY_COLS = 8;
SequencerView.NUM_OCTAVE       = 12;
SequencerView.START_KEY = 36;

function SequencerView (model)
{
    AbstractSequencerView.call (this, model, 128, 8);
    this.scales = model.getScales ();
    this.offsetY = SequencerView.START_KEY;
    this.clip.scrollToKey (SequencerView.START_KEY);
    this.clip.scrollToStep (0);
}
SequencerView.prototype = new AbstractSequencerView ();

SequencerView.prototype.onActivate = function ()
{
    this.updateScale ();
    AbstractSequencerView.prototype.onActivate.call (this);
};

SequencerView.prototype.updateNoteMapping = function ()
{
    AbstractSequencerView.prototype.updateNoteMapping.call (this);
    this.updateScale ();
};

SequencerView.prototype.updateScale = function ()
{
    var t = this.model.getTrackBank ().getSelectedTrack ();
    this.noteMap = t != null && t.canHoldNotes ? this.scales.getSequencerMatrix (SequencerView.NUM_DISPLAY_ROWS, this.offsetY) : this.scales.getEmptyMatrix ();
};

SequencerView.prototype.updateArrows = function ()
{
    this.canScrollUp = this.offsetY + SequencerView.NUM_OCTAVE <= this.rows - SequencerView.NUM_OCTAVE;
    this.canScrollDown = this.offsetY - SequencerView.NUM_OCTAVE >= 0;
    this.canScrollLeft = this.offsetX > 0;
    BaseView.prototype.updateArrows.call (this);
    // TODO we need a track change callbck, this belongs in it
    this.drawSceneButtons ();
};

SequencerView.prototype.usesButton = function (buttonID)
{
    switch (buttonID)
    {
        case PUSH_BUTTON_OCTAVE_DOWN:
        case PUSH_BUTTON_OCTAVE_UP:
        case PUSH_BUTTON_CLIP:
        case PUSH_BUTTON_SELECT:
        case PUSH_BUTTON_ADD_EFFECT:
        case PUSH_BUTTON_ADD_TRACK:
        case PUSH_BUTTON_REPEAT:
        case PUSH_BUTTON_USER_MODE:
        case PUSH_BUTTON_DUPLICATE:
            return false;
    }
    return true;
};

SequencerView.prototype.onGridNote = function (note, velocity)
{
    if (velocity == 0)
        return;
    var index = note - 36;
    var x = index % 8;
    var y = Math.floor (index / 8);
    this.clip.toggleStep (x, this.noteMap[y], Config.accentActive ? Config.fixedAccentValue : velocity);
};

SequencerView.prototype.scrollLeft = function (event)
{
    var newOffset = this.offsetX - SequencerView.NUM_DISPLAY_COLS;
    if (newOffset < 0)
        this.offsetX = 0;
    else
    {
        this.offsetX = newOffset;
        this.clip.scrollStepsPageBackwards ();
    }
};

SequencerView.prototype.scrollRight = function (event)
{
    this.offsetX = this.offsetX + SequencerView.NUM_DISPLAY_COLS;
    this.clip.scrollStepsPageForward ();
};

SequencerView.prototype.scrollUp = function (event)
{
    this.offsetY = Math.min (this.rows - SequencerView.NUM_OCTAVE, this.offsetY + SequencerView.NUM_OCTAVE);
    this.updateScale ();
};

SequencerView.prototype.scrollDown = function (event)
{
    this.offsetY = Math.max (0, this.offsetY - SequencerView.NUM_OCTAVE);
    this.updateScale ();
};

SequencerView.prototype.drawGrid = function ()
{
    this.turnOffBlink ();

    var t = this.model.getTrackBank ().getSelectedTrack ();
    var isKeyboardEnabled = t != null && t.canHoldNotes;

    var hiStep = this.isInXRange (this.step) ? this.step % SequencerView.NUM_DISPLAY_COLS : -1;
    for (var x = 0; x < SequencerView.NUM_DISPLAY_COLS; x++)
    {
        for (var y = 0; y < SequencerView.NUM_DISPLAY_ROWS; y++)
        {
            var row = this.noteMap[y];
            var isSet = this.data[x][row];
            var hilite = x == hiStep;
            if (isKeyboardEnabled)
                this.surface.pads.lightEx (x, y, isSet ? (hilite ? PUSH_COLOR2_GREEN_HI : PUSH_COLOR2_BLUE) : hilite ? PUSH_COLOR2_GREEN_HI : this.scales.getSequencerColor (this.noteMap, y));
            else
                this.surface.pads.lightEx (x, y, PUSH_COLOR2_BLACK);
        }
    }
};

SequencerView.prototype.isInXRange = function (x)
{
    return x >= this.offsetX && x < this.offsetX + SequencerView.NUM_DISPLAY_COLS;
};
