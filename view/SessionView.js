// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function SessionView (model)
{
    AbstractSessionView.call (this, model, 8, 8);
}
SessionView.prototype = new AbstractSessionView ();

SessionView.prototype.onActivate = function ()
{
    AbstractSessionView.prototype.onActivate.call (this);
    this.surface.setButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_HI);

    this.updateRibbonMode ();
};

SessionView.prototype.onPitchbend = function (data1, data2)
{
    this.model.getTransport ().setCrossfade (data2);
    this.surface.output.sendPitchbend (0, data2);
};

SessionView.prototype.updateRibbonMode = function ()
{
    this.surface.setRibbonMode (PUSH_RIBBON_PAN);
    this.surface.output.sendPitchbend (0, this.model.getTransport ().getCrossfade ());
};

SessionView.prototype.drawSceneButtons = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    for (var i = 0; i < 8; i++)
    {
        if (this.flip)
            this.surface.setButton (PUSH_BUTTON_SCENE1 + (7 - i), tb.getTrack (i).recarm ? PUSH_COLOR_SCENE_RED : PUSH_COLOR_BLACK);
        else
            this.surface.setButton (PUSH_BUTTON_SCENE1 + i, PUSH_COLOR_SCENE_GREEN);
    }
};

SessionView.prototype.updateDevice = function ()
{
    var m = this.surface.getActiveMode ();
    if (m != null)
    {
        m.updateDisplay ();
        m.updateSecondRow ();
    }

    if (this.flip && !m.hasSecondRowPriority)
    {
        for (var i = 0; i < 8; i++)
            this.surface.setButton (20 + i, PUSH_COLOR_GREEN_HI);
    }
    else
        m.updateFirstRow ();

    this.updateButtons ();
    this.updateArrows ();
};

SessionView.prototype.usesButton = function (buttonID)
{
    switch (buttonID)
    {
        case PUSH_BUTTON_OCTAVE_DOWN:
        case PUSH_BUTTON_OCTAVE_UP:
        case PUSH_BUTTON_ADD_EFFECT:
        case PUSH_BUTTON_REPEAT:
        case PUSH_BUTTON_ACCENT:
        case PUSH_BUTTON_USER_MODE:
        case PUSH_BUTTON_DUPLICATE:
            return false;
    }
    return true;
};

SessionView.prototype.onAccent = function (event)
{
    // No accent button usage in the Session view
};

SessionView.prototype.onSession = function (event)
{
    if (event.isLong ())
        this.isTemporary = true;
    else if (event.isUp ())
    {
        if (this.isTemporary)
        {
            this.isTemporary = false;
            this.surface.setActiveView (AbstractView.lastNoteView);
        }
    }
    else if (event.isDown ())
    {
        this.flip = !this.flip;
        var dUp   = this.canScrollUp;
        var dDown = this.canScrollDown;
        this.canScrollUp = this.canScrollLeft;
        this.canScrollDown = this.canScrollRight;
        this.canScrollLeft = dUp;
        this.canScrollRight = dDown;
        this.drawSceneButtons ();
    }
};

SessionView.prototype.onScene = function (scene)
{
    this.sceneOrFirstRowButtonPressed (scene, !this.flip);
};

SessionView.prototype.onFirstRow = function (index)
{
    if (this.surface.getActiveMode ().hasSecondRowPriority)
        AbstractView.prototype.onFirstRow.call (this, index);
    else
        this.sceneOrFirstRowButtonPressed (index, this.flip);
};

SessionView.prototype.onSecondRow = function (index)
{
    if (this.surface.isShiftPressed ())
        this.model.getCurrentTrackBank ().returnToArrangement (index);
    else
        AbstractView.prototype.onSecondRow.call (this, index);
};

// Rec-Enable and Scene Start are flipped
SessionView.prototype.sceneOrFirstRowButtonPressed = function (index, isScene)
{
    if (isScene)
        this.model.getCurrentTrackBank ().launchScene (index);
    else
    {
        if (this.surface.isPressed (PUSH_BUTTON_STOP))
            this.model.getCurrentTrackBank ().stop (index);
        else
        {
            this._onFirstRow (index);
            this.drawSceneButtons ();
        }
    }
};

// The logic for arming a track moved to AbstractTrackMode.onFirstRow()
// still, just reimplementing the logic here doesn't seem 'bad'
SessionView.prototype._onFirstRow = function (index)
{
    var tb = this.model.getCurrentTrackBank ();
    var selTrack = tb.getSelectedTrack ();
    if ((selTrack != null && selTrack.index == index) || this.surface.isShiftPressed ())
        tb.toggleArm (index);
    else
        tb.select (index);
};
