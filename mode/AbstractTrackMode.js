// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function AbstractTrackMode (model)
{
    BaseMode.call (this, model);
    this.hasSecondRowPriority = false;
    this.isTemporary = false;
}
AbstractTrackMode.prototype = new BaseMode ();

AbstractTrackMode.prototype.onFirstRow = function (index)
{
    var tb = this.model.getTrackBank ();
    var selTrack = tb.getSelectedTrack ();
    if ((selTrack != null && selTrack.index == index) || this.surface.isShiftPressed ())
        this.model.getTrackBank ().toggleArm (index);
    else
        this.model.getTrackBank ().select (index);
};

AbstractTrackMode.prototype.onSecondRow = function (index)
{
    var tb = this.model.getTrackBank ();
    if (tb.isMuteState ())
        tb.toggleMute (index);
    else
        tb.toggleSolo (index);
};

AbstractTrackMode.prototype.updateFirstRow = function ()
{
    var tb = this.model.getTrackBank ();
    for (var i = 0; i < 8; i++)
    {
        // Light up selection and record buttons
        this.surface.setButton (20 + i, this.getTrackButtonColor (tb.getTrack (i)));
    }
};

AbstractTrackMode.prototype.updateSecondRow = function ()
{
    var tb = this.model.getTrackBank ();
    var muteState = tb.isMuteState ();
    for (var i = 0; i < 8; i++)
    {
        var t = tb.getTrack (i);
        this.surface.setButton (102 + i, t.name != '' && !(muteState ? t.mute : t.solo) ?
            muteState ? PUSH_COLOR2_YELLOW_HI : PUSH_COLOR2_BLUE_HI : PUSH_COLOR_BLACK);
    }
};

AbstractTrackMode.prototype.drawRow4 = function ()
{
    var tb = this.model.getTrackBank ();
    var selTrack = tb.getSelectedTrack ();

    // Format track names
    var selIndex = selTrack == null ? -1 : selTrack.index;
    var d = this.surface.display;
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
    var exists = track.name != '';
    if (!exists)
        return PUSH_COLOR_BLACK;

    var tb = this.model.getTrackBank ();
    var selTrack = tb.getSelectedTrack ();
    var selIndex = selTrack == null ? -1 : selTrack.index;
    var isSel = track.index == selIndex;

    if (track.recarm)
        return isSel ? PUSH_COLOR_RED_HI : PUSH_COLOR_RED_LO;

    return isSel ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_YELLOW_LO;
};