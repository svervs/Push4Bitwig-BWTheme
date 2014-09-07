// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function AbstractTrackMode (model)
{
    BaseMode.call (this, model);
    this.hasSecondRowPriority = false;
    this.isTemporary = false;
}
AbstractTrackMode.prototype = new BaseMode ();

AbstractTrackMode.prototype.onFirstRow = function (index)
{
    var tb = this.model.getCurrentTrackBank ();
    var selTrack = tb.getSelectedTrack ();
    if ((selTrack != null && selTrack.index == index) || this.surface.isShiftPressed ())
        tb.toggleArm (index);
    else
        tb.select (index);
};

AbstractTrackMode.prototype.onSecondRow = function (index)
{
    var tb = this.model.getCurrentTrackBank ();
    if (tb.isMuteState ())
        tb.toggleMute (index);
    else
        tb.toggleSolo (index);
};

AbstractTrackMode.prototype.updateFirstRow = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    for (var i = 0; i < 8; i++)
    {
        // Light up selection and record buttons
        this.surface.setButton (20 + i, this.getTrackButtonColor (tb.getTrack (i)));
    }
};

AbstractTrackMode.prototype.updateSecondRow = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    var muteState = tb.isMuteState ();
    for (var i = 0; i < 8; i++)
    {
        var t = tb.getTrack (i);
        
        var color = PUSH_COLOR_BLACK;
        if (t.exists)
        {
            if (muteState)
            {
                if (!t.mute)
                    color = PUSH_COLOR2_YELLOW_HI;
            }
            else
                color = t.solo ? PUSH_COLOR2_BLUE_HI : PUSH_COLOR2_GREY_LO;
        }
        this.surface.setButton (102 + i, color);
    }
};

AbstractTrackMode.prototype.drawRow4 = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    var selTrack = tb.getSelectedTrack ();

    // Format track names
    var selIndex = selTrack == null ? -1 : selTrack.index;
    var d = this.surface.getDisplay ();
    for (var i = 0; i < 8; i++)
    {
        var isSel = i == selIndex;
        var t = tb.getTrack (i);
        var n = optimizeName (t.name, isSel ? 7 : 8);
        d.setCell (3, i, isSel ? Display.RIGHT_ARROW + n : n, Display.FORMAT_RAW);
    }
    d.done (3);
};

AbstractTrackMode.prototype.getTrackButtonColor = function (track)
{
    if (!track.exists)
        return PUSH_COLOR_BLACK;

    var tb = this.model.getCurrentTrackBank ();
    var selTrack = tb.getSelectedTrack ();
    var selIndex = selTrack == null ? -1 : selTrack.index;
    var isSel = track.index == selIndex;

    if (track.recarm)
        return isSel ? PUSH_COLOR_RED_HI : PUSH_COLOR_RED_LO;

    return isSel ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_YELLOW_LO;
};