// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

RaindropsView.NUM_DISPLAY_ROWS = 8;
RaindropsView.NUM_DISPLAY_COLS = 8;
RaindropsView.NUM_OCTAVE       = 12;
RaindropsView.START_KEY        = 36;

function RaindropsView (model)
{
    AbstractSequencerView.call (this, model, 128, RaindropsView.NUM_DISPLAY_COLS);
    this.offsetY = RaindropsView.START_KEY;
    this.clip.scrollTo (0, RaindropsView.START_KEY);
    
    this.drops = [];
    for (var i = 0; i < 128; i++)
        this.drops.push ({ start: -1, pos: -1, dirDown: false, velocity: 0 });
}
RaindropsView.prototype = new AbstractSequencerView ();

RaindropsView.prototype.onActivate = function ()
{
    this.updateScale ();
    AbstractSequencerView.prototype.onActivate.call (this);
    
    this.clip.clip.addPlayingStepObserver (doObject (this, RaindropsView.prototype.handlePlayingStep));
};

RaindropsView.prototype.updateArrowStates = function ()
{
    this.canScrollUp = false;
    this.canScrollDown = false;
    this.canScrollLeft = this.offsetY - RaindropsView.NUM_OCTAVE >= 0;
    this.canScrollRight = this.offsetY + RaindropsView.NUM_OCTAVE <= this.clip.getRowSize () - RaindropsView.NUM_OCTAVE;

    this.drawSceneButtons ();
};

RaindropsView.prototype.updateNoteMapping = function ()
{
    AbstractSequencerView.prototype.updateNoteMapping.call (this);
    this.updateScale ();
};

RaindropsView.prototype.updateScale = function ()
{
    var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
    this.noteMap = t != null && t.canHoldNotes ? this.scales.getSequencerMatrix (RaindropsView.NUM_DISPLAY_ROWS, this.offsetY) : this.scales.getEmptyMatrix ();
};

RaindropsView.prototype.usesButton = function (buttonID)
{
// TODO
    switch (buttonID)
    {
        case PUSH_BUTTON_ADD_EFFECT:
        case PUSH_BUTTON_REPEAT:
        case PUSH_BUTTON_USER_MODE:
        case PUSH_BUTTON_DUPLICATE:
            return false;
    }
    return true;
};

RaindropsView.prototype.onGridNote = function (note, velocity)
{
    if (velocity == 0)
        return;
    var index = note - 36;
    var x = index % 8;
    var y = Math.floor (index / 8);
    
    var raindrop = this.drops[this.noteMap[x]];
    if (raindrop.start == y)
    {
        raindrop.start = -1;
        this.surface.sendMidiEvent (0x80, this.noteMap[x], 0);
        return;
    }
    raindrop.start    = y;
    raindrop.pos      = y;
    raindrop.dirDown  = true;
    raindrop.velocity = Config.accentActive ? Config.fixedAccentValue : velocity;
};

RaindropsView.prototype.onOctaveDown = function (event)
{
    if (event.isDown ())
        this.scrollDown (event);
};

RaindropsView.prototype.onOctaveUp = function (event)
{
    if (event.isDown ())
        this.scrollUp (event);
};

RaindropsView.prototype.scrollRight = function (event)
{
    this.offsetY = Math.min (this.clip.getRowSize () - RaindropsView.NUM_OCTAVE, this.offsetY + RaindropsView.NUM_OCTAVE);
    this.updateScale ();
    this.surface.getDisplay ().showNotification ('          ' + this.scales.getSequencerRangeText (this.noteMap[0], this.noteMap[7]));
};

RaindropsView.prototype.scrollLeft = function (event)
{
    this.offsetY = Math.max (0, this.offsetY - RaindropsView.NUM_OCTAVE);
    this.updateScale ();
    this.surface.getDisplay ().showNotification ('          ' + this.scales.getSequencerRangeText (this.noteMap[0], this.noteMap[7]));
};

RaindropsView.prototype.handlePlayingStep = function (step)
{
    for (var i = 0; i < 128; i++)
    {
        var raindrop = this.drops[i];
        if (raindrop.start == -1)
            continue;
            
        if (raindrop.start == 0)
        {
            this.surface.sendMidiEvent (0x90, i, raindrop.velocity);
            continue;
        }
        
        this.surface.sendMidiEvent (0x80, i, 0);
        if (raindrop.dirDown)
        {
            raindrop.pos--;
            if (raindrop.pos == 0)
            {
                this.surface.sendMidiEvent (0x90, i, raindrop.velocity);
                raindrop.dirDown = false;
            }
        }
        else
        {
            raindrop.pos++;
            if (raindrop.pos == raindrop.start)
                raindrop.dirDown = true;
        }
    }
}

RaindropsView.prototype.drawGrid = function ()
{
    var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
    var isKeyboardEnabled = t != null && t.canHoldNotes;
    if (!isKeyboardEnabled)
    {
        this.surface.pads.turnOff ();
        return;
    }

    for (var x = 0; x < RaindropsView.NUM_DISPLAY_COLS; x++)
    {
        var raindrop = this.drops[this.noteMap[x]];
        var scaleColor = this.scales.getColor (this.noteMap, x)
        for (var y = 0; y < SequencerView.NUM_DISPLAY_ROWS; y++)
        {
            var color = y == 0 ? scaleColor : PUSH_COLOR2_BLACK;
            if (raindrop.start != -1)
            {
                if (raindrop.pos == y)
                    color = PUSH_COLOR2_GREEN_HI;
                else if (raindrop.start == y)
                    color = PUSH_COLOR2_BLUE;
            }
            this.surface.pads.lightEx (x, 7 - y, color, null, false);
        }
    }
};
