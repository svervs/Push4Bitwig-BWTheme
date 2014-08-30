// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function BaseMode (model)
{
    AbstractMode.call (this, model);
}
BaseMode.prototype = new AbstractMode ();

BaseMode.prototype.updateFirstRow = function ()
{
    var tb = this.model.getTrackBank ();
    var selTrack = tb.getSelectedTrack ();
    var selIndex = selTrack == null ? -1 : selTrack.index;
    for (var i = 0; i < 8; i++)
    {
        var isSel = i == selIndex;
        // Light up selection and record buttons
        this.surface.setButton (20 + i, isSel ? PUSH_COLOR_ORANGE_LO : PUSH_COLOR_BLACK);
    }
};

BaseMode.prototype.updateSecondRow = function ()
{
    var tb = this.model.getTrackBank ();
    for (var i = 0; i < 8; i++)
    {
        var t = tb.getTrack (i);
        if (!this.hasSecondRowPriority)
            this.surface.setButton (102 + i, t.recarm ? PUSH_COLOR2_RED_LO : PUSH_COLOR2_BLACK);
    }
};
