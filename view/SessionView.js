// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function SessionView (model)
{
    BaseView.call (this, model);

    this.flip = false;

    this.scrollerInterval = Config.sceneScrollInterval;
}
SessionView.prototype = new BaseView ();

SessionView.prototype.onActivate = function ()
{
    BaseView.prototype.onActivate.call (this);

    this.push.setButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_ON);
    this.push.setButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_HI);
    this.model.getTrackBank ().setIndication (true);
    this.drawSceneButtons ();
};

SessionView.prototype.drawSceneButtons = function ()
{
    var tb = this.model.getTrackBank ();
    for (var i = 0; i < 8; i++)
    {
        if (this.flip)
            this.push.setButton (PUSH_BUTTON_SCENE1 + (7 - i), tb.getTrack (i).recarm ? PUSH_COLOR_SCENE_RED : PUSH_COLOR_BLACK);
        else
            this.push.setButton (PUSH_BUTTON_SCENE1 + i, PUSH_COLOR_SCENE_GREEN);
    }
};

SessionView.prototype.updateDevice = function ()
{
    var m = this.push.getActiveMode ();
    if (m != null)
    {
        m.updateDisplay ();
        //m.updateFirstRow ();
        m.updateSecondRow ();
    }

    if (this.flip && !this.push.getMode (this.push.getCurrentMode ()).hasSecondRowPriority)
    {
        for (var i = 0; i < 8; i++)
            this.push.setButton (20 + i, PUSH_COLOR_GREEN_MD);
    }
    else
    {
        m.updateFirstRow ();
    }

    this.updateArrows ();
};

SessionView.prototype.updateArrows = function ()
{
    var tb = this.model.getTrackBank ();
    this.canScrollUp = this.flip ? tb.canScrollTracksUp () : tb.canScrollScenesDown ();
    this.canScrollDown = this.flip ? tb.canScrollTracksDown () : tb.canScrollScenesUp ();
    this.canScrollLeft = this.flip ? tb.canScrollScenesDown () : tb.canScrollTracksUp ();
    this.canScrollRight = this.flip ? tb.canScrollScenesUp () : tb.canScrollTracksDown ();
    BaseView.prototype.updateArrows.call (this);
    // TODO flipped scene buttons are not updated unless we redraw them here
    this.drawSceneButtons();
};

SessionView.prototype.usesButton = function (buttonID)
{
    switch (buttonID)
    {
        case PUSH_BUTTON_OCTAVE_DOWN:
        case PUSH_BUTTON_OCTAVE_UP:
        case PUSH_BUTTON_ADD_EFFECT:
        case PUSH_BUTTON_ADD_TRACK:
        case PUSH_BUTTON_REPEAT:
        case PUSH_BUTTON_ACCENT:
        case PUSH_BUTTON_USER_MODE:
        case PUSH_BUTTON_DUPLICATE:
            return false;
    }
    return true;
};

SessionView.prototype.onGrid = function (note, velocity)
{
    if (velocity == 0)
        return;

    var index = note - 36;
    var t = index % 8;
    var s = 7 - Math.floor (index / 8);
    
    if (this.flip)
    {
        var dummy = t;
        t = s;
        s = dummy;
    }

    var tb = this.model.getTrackBank ();
    var slot = tb.getTrack (t).slots[s];
    var slots = tb.getClipLauncherSlots (t);
    
    if (!this.push.isSelectPressed ())
    {
        if (tb.getTrack (t).recarm)
        {
            if (slot.isRecording)
                slots.launch (s);
            else
                slots.record (s);
        }
        else
            slots.launch (s);
    }
     slots.select (s);
};

SessionView.prototype.onClip = function (event)
{
    if (!event.isDown ())
        return;
    var t = this.model.getTrackBank ().getSelectedTrack ();
    if (t == null)
        return;
    var slot = this.getSelectedSlot (t);
    if (slot != -1)
        this.model.getTrackBank ().getClipLauncherSlots (t.index).showInEditor (slot);
};

SessionView.prototype.onAccent = function (event)
{
    // No accent button usage in the Session view
};

SessionView.prototype.onSession = function (event)
{
    if (!event.isDown ())
        return;
        
    this.flip = !this.flip;
    var dUp   = this.canScrollUp;
    var dDown = this.canScrollDown;
    this.canScrollUp = this.canScrollLeft;
    this.canScrollDown = this.canScrollRight;
    this.canScrollLeft = dUp;
    this.canScrollRight = dDown;
    this.drawSceneButtons ();
};

SessionView.prototype.scrollLeft = function (event)
{
    var tb = this.model.getTrackBank ();
    if (this.flip)
    {
        if (this.push.isShiftPressed ())
            tb.scrollScenesPageUp ();
        else
            tb.scrollScenesUp ();
    }
    else
    {
        if (this.push.isShiftPressed ())
            tb.scrollTracksPageUp ();
        else
            tb.scrollTracksUp ();
    }
};

SessionView.prototype.scrollRight = function (event)
{
    var tb = this.model.getTrackBank ();
    if (this.flip)
    {
        if (this.push.isShiftPressed ())
            tb.scrollScenesPageDown ();
        else
            tb.scrollScenesDown ();
    }
    else
    {
        if (this.push.isShiftPressed ())
            tb.scrollTracksPageDown ();
        else
            tb.scrollTracksDown ();
    }
};

SessionView.prototype.scrollUp = function (event)
{
    var tb = this.model.getTrackBank ();
    if (this.flip)
    {
        if (this.push.isShiftPressed ())
            tb.scrollTracksPageUp ();
        else
            tb.scrollTracksUp ();
    }
    else
    {
        if (this.push.isShiftPressed ())
            tb.scrollScenesPageUp ();
        else
            tb.scrollScenesUp ();
    }
};

SessionView.prototype.scrollDown = function (event)
{
    var tb = this.model.getTrackBank ();
    if (this.flip)
    {
        if (this.push.isShiftPressed ())
            tb.scrollTracksPageDown ();
        else
            tb.scrollTracksDown ();
    }
    else
    {
        if (this.push.isShiftPressed ())
            tb.scrollScenesPageDown ();
        else
            tb.scrollScenesDown ();
    }
};

SessionView.prototype.onScene = function (scene)
{
    this.sceneOrFirstRowButtonPressed (scene, !this.flip);
};

SessionView.prototype.onFirstRow = function (index)
{
    if (this.push.getMode (this.push.getCurrentMode ()).hasSecondRowPriority)
        BaseView.prototype.onFirstRow.call (this, index);
    else
        this.sceneOrFirstRowButtonPressed (index, this.flip);
};

// Rec-Enable and Scene Start are flipped
SessionView.prototype.sceneOrFirstRowButtonPressed = function (index, isScene)
{
    if (isScene)
        this.model.getTrackBank ().launchScene (index);
    else
    {
        if (this.push.isPressed (PUSH_BUTTON_STOP))
            this.model.getTrackBank ().stop (index);
        else if (this.push.isShiftPressed ())
            this.model.getTrackBank ().returnToArrangement (index);
        else
        {
            this._onFirstRow (index);
            this.drawSceneButtons ();
        }
    }
};

// the logic for arming a track moved to AbstractTrackMode.onFirstRow()
// still, just reimplementing the logic here doesn't seem 'bad'
SessionView.prototype._onFirstRow = function (index)
{
    var tb = this.model.getTrackBank ();
    var selTrack = tb.getSelectedTrack ();
    if ((selTrack != null && selTrack.index == index) || this.push.isShiftPressed ())
    {
        this.model.getTrackBank ().toggleArm (index);
    }
    else
    {
        this.model.getTrackBank ().select (index);
    }
};

SessionView.prototype.drawGrid = function ()
{
    var tb = this.model.getTrackBank ();
    for (var x = 0; x < 8; x++)
    {
        var t = tb.getTrack (x);
        for (var y = 0; y < 8; y++)
            this.drawPad (t.slots[y], this.flip ? y : x, this.flip ? x : y, t.recarm);
    }
};

SessionView.prototype.drawPad = function (slot, x, y, isArmed)
{
    var color = slot.isRecording ? PUSH_COLOR_RED_HI :
        (slot.hasContent ?
            (slot.color ? slot.color : PUSH_COLOR_ORANGE_HI) :
            (isArmed ? PUSH_COLOR_RED_LO : PUSH_COLOR_BLACK));
    var n = 92 + x - 8 * y;
    this.push.pads.light (n, color);
    this.push.pads.blink (n, (slot.isQueued || slot.isPlaying) ? (slot.isRecording ? PUSH_COLOR_RED_HI : PUSH_COLOR_GREEN_HI) : PUSH_COLOR_BLACK, slot.isQueued);
};
