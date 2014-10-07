// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

FixedMode.CLIP_LENGTHS = [ '1 Beat', '2 Beats', '1 Bar', '2 Bars', '4 Bars', '8 Bars', '16 Bars', '32 Bars' ];

function FixedMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_FIXED;
}
FixedMode.prototype = new BaseMode ();

FixedMode.prototype.onFirstRow = function (index)
{
    this.model.getCurrentTrackBank ().setNewClipLength (index);
};

FixedMode.prototype.onSecondRow = function (index) {};

FixedMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    d.clearRow (0).done (0).clearRow (1).done (1)
     .setBlock (2, 0, 'New Clip Length:').clearBlock (2, 1).clearBlock (2, 2).clearBlock (2, 3)
     .done (2);
    var tb = this.model.getCurrentTrackBank ();
    for (var i = 0; i < 8; i++)
        d.setCell (3, i, (tb.getNewClipLength () == i ? Display.RIGHT_ARROW : ' ') + FixedMode.CLIP_LENGTHS[i]);
    d.done (3);
};

FixedMode.prototype.updateFirstRow = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    for (var i = 0; i < 8; i++)
        this.surface.setButton (20 + i, tb.getNewClipLength () == i ? PUSH_COLOR_YELLOW_LO : PUSH_COLOR_GREEN_LO);
};

FixedMode.prototype.updateSecondRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (102 + i, PUSH_COLOR2_BLACK);
};
