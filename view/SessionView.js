// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function SessionView (model)
{
    AbstractSessionView.call (this, model, 8, 8);
}
SessionView.prototype = new AbstractSessionView ();

SessionView.prototype.onActivate = function ()
{
    AbstractSessionView.prototype.onActivate.call (this);
    this.surface.updateButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_ON);
    this.surface.updateButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_HI);

    this.updateRibbonMode ();
};

SessionView.prototype.onPitchbend = function (data1, data2)
{
    if (this.surface.isShiftPressed ())
        data2 = 63;
    this.model.getTransport ().setCrossfade (Config.toDAWValue (data2));
    this.surface.setRibbonValue (data2);
};

SessionView.prototype.updateRibbonMode = function ()
{
    this.surface.setRibbonMode (PUSH_RIBBON_PAN);
    this.surface.setRibbonValue (Config.toMidiValue(this.model.getTransport ().getCrossfade ()));
};

SessionView.prototype.drawSceneButtons = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    var color = PUSH_COLOR_BLACK;
    for (var i = 0; i < 8; i++)
    {
        if (Config.flipSession)
        {
            var track = tb.getTrack (i);
            if (tb.isMuteState ())
                color = track.mute ? PUSH_COLOR_BLACK : PUSH_COLOR_SCENE_ORANGE_HI; // BWS Color Theme
            else
                color = track.solo ? PUSH_COLOR_SCENE_RED : PUSH_COLOR_BLACK;
            this.surface.updateButton (PUSH_BUTTON_SCENE1 + (7 - i), track.exists ? color : PUSH_COLOR_BLACK);
        }
        else
            this.surface.updateButton (PUSH_BUTTON_SCENE1 + i, PUSH_COLOR_SCENE_YELLOW_HI); // BWS Color Theme
    }
};

SessionView.prototype.drawGrid = function ()
{
    AbstractSessionView.prototype.drawGrid.call (this);

    // Also update the value of the ribbon
    this.updateRibbonMode ();
};

SessionView.prototype.updateDevice = function ()
{
    var m = this.surface.getActiveMode ();
    if (m != null)
    {
        m.updateDisplay ();
        m.updateFirstRow ();
    }

    if (Config.flipSession && !m.hasSecondRowPriority)
    {
        for (var i = 0; i < 8; i++)
            this.surface.updateButton (102 + i, PUSH_COLOR2_WHITE); // BWS Color Theme
    }
    else
        m.updateSecondRow ();

    this.updateButtons ();
    this.updateArrows ();
};

SessionView.prototype.usesButton = function (buttonID)
{
    switch (buttonID)
    {
        case PUSH_BUTTON_OCTAVE_DOWN:
        case PUSH_BUTTON_OCTAVE_UP:
        case PUSH_BUTTON_REPEAT:
        case PUSH_BUTTON_ACCENT:
        case PUSH_BUTTON_ADD_EFFECT:
            return false;
    }
    
    if (Config.isPush2 && buttonID == PUSH_BUTTON_USER_MODE)
        return false;
    
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
            var tb = this.model.getTrackBank ();
            var viewId = tb.getPreferredView (tb.getSelectedTrack ().index);
            if (viewId != null)
                this.surface.setActiveView (viewId);
        }
    }
    else if (event.isDown ())
    {
        Config.setFlipSession (!Config.flipSession);
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
    this.sceneOrSecondRowButtonPressed (scene, !Config.flipSession);
};

SessionView.prototype.onSecondRow = function (index)
{
    if (this.surface.getActiveMode ().hasSecondRowPriority)
        AbstractView.prototype.onSecondRow.call (this, index);
    else
        this.sceneOrSecondRowButtonPressed (index, Config.flipSession);
};

SessionView.prototype.sceneOrSecondRowButtonPressed = function (index, isScene)
{
    if (isScene)
        this.model.getCurrentTrackBank ().launchScene (index);
    else
    {
        if (this.surface.isPressed (PUSH_BUTTON_STOP))
            this.model.getCurrentTrackBank ().stop (index);
        else if (this.surface.isShiftPressed ())
            this.model.getCurrentTrackBank ().returnToArrangement (index);
        else
        {
            if (Config.flipSession)
            {
                // Only execute Solo or Mute
                this.surface.getMode (MODE_TRACK).onSecondRow (index);
            }
            else
                AbstractView.prototype.onSecondRow.call (this, index);
            
            this.drawSceneButtons ();
        }
    }
};
