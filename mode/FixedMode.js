// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

FixedMode.CLIP_LENGTHS = [ '1 Beat', '2 Beats', '1 Bar', '2 Bars', '4 Bars', '8 Bars', '16 Bars', '32 Bars' ];

function FixedMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_FIXED;
    this.isTemporary = false;
}
FixedMode.prototype = new BaseMode ();

FixedMode.prototype.onFirstRow = function (index)
{
    this.model.getCurrentTrackBank ().setNewClipLength (index);
    this.surface.setPendingMode (this.surface.getPreviousMode ());
};

FixedMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    d.clear ().setBlock (1, 0, 'New Clip Length:');
    var tb = this.model.getCurrentTrackBank ();
    for (var i = 0; i < 8; i++)
        d.setCell (3, i, (tb.getNewClipLength () == i ? Display.RIGHT_ARROW : '') + FixedMode.CLIP_LENGTHS[i]);
    d.allDone ();
};

FixedMode.prototype.updateFirstRow = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    for (var i = 0; i < 8; i++)
        this.surface.setButton (20 + i, tb.getNewClipLength () == i ? PUSH_COLOR_YELLOW_LO : PUSH_COLOR_GREEN_LO);
};
