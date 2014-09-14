// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

SequencerView.NUM_DISPLAY_ROWS = 8;
SequencerView.NUM_DISPLAY_COLS = 8;
SequencerView.NUM_OCTAVE       = 12;
SequencerView.START_KEY        = 36;

function SequencerView (model)
{
    AbstractSequencerView.call (this, model, 128, SequencerView.NUM_DISPLAY_COLS);
    this.offsetY = SequencerView.START_KEY;
    this.clip.scrollTo (0, SequencerView.START_KEY);
}
SequencerView.prototype = new AbstractSequencerView ();

SequencerView.prototype.onActivate = function ()
{
    this.updateScale ();
    AbstractSequencerView.prototype.onActivate.call (this);
};

SequencerView.prototype.updateArrows = function ()
{
    this.canScrollUp = this.offsetY + SequencerView.NUM_OCTAVE <= this.clip.getRowSize () - SequencerView.NUM_OCTAVE;
    this.canScrollDown = this.offsetY - SequencerView.NUM_OCTAVE >= 0;
    this.canScrollLeft = this.offsetX > 0;
    // this.canScrollRight = true; We do not know the number of steps
    AbstractView.prototype.updateArrows.call (this);
    this.drawSceneButtons ();
};

SequencerView.prototype.updateNoteMapping = function ()
{
    AbstractSequencerView.prototype.updateNoteMapping.call (this);
    this.updateScale ();
};

SequencerView.prototype.updateScale = function ()
{
    var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
    this.noteMap = t != null && t.canHoldNotes ? this.scales.getSequencerMatrix (SequencerView.NUM_DISPLAY_ROWS, this.offsetY) : this.scales.getEmptyMatrix ();
};

SequencerView.prototype.usesButton = function (buttonID)
{
    switch (buttonID)
    {
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
    this.offsetY = Math.min (this.clip.getRowSize () - SequencerView.NUM_OCTAVE, this.offsetY + SequencerView.NUM_OCTAVE);
    this.updateScale ();
    this.surface.getDisplay ().showNotification ('          ' + this.scales.getSequencerRangeText (this.noteMap[0], this.noteMap[7]));
};

SequencerView.prototype.scrollDown = function (event)
{
    this.offsetY = Math.max (0, this.offsetY - SequencerView.NUM_OCTAVE);
    this.updateScale ();
    this.surface.getDisplay ().showNotification ('          ' + this.scales.getSequencerRangeText (this.noteMap[0], this.noteMap[7]));
};

SequencerView.prototype.drawGrid = function ()
{
    var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
    var isKeyboardEnabled = t != null && t.canHoldNotes;

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
};
