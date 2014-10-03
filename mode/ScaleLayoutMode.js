// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function ScaleLayoutMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_SCALE_LAYOUT;
    this.scales = model.getScales ();
}
ScaleLayoutMode.prototype = new BaseMode ();

ScaleLayoutMode.prototype.onFirstRow = function (index)
{
    if (index > 5)
        return;
    this.scales.setScaleLayout (index);
    this.surface.getActiveView ().updateNoteMapping ();
    Config.setScaleLayout (Scales.LAYOUT_NAMES[this.scales.getScaleLayout ()]);
};

ScaleLayoutMode.prototype.onSecondRow = function (index) {};

ScaleLayoutMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    d.clearRow (0).clearRow (1).clearRow (2).setBlock (2, 0, 'Scale layout:');

    var sl = this.scales.getScaleLayout ();
    for (var i = 0; i < 8; i++)
    {
        var isSel = sl == i;
        if (i > 5)
            d.clearCell (3, i);
        else
            d.setCell (3, i, (isSel ? Display.RIGHT_ARROW : ' ') + Scales.LAYOUT_NAMES[i]);
    }
    d.allDone ();
};

ScaleLayoutMode.prototype.updateFirstRow = function ()
{
    var sl = this.scales.getScaleLayout ();
    for (var i = 0; i < 8; i++)
        this.surface.setButton (20 + i, i > 5 ? PUSH_COLOR_BLACK : (sl == i ? PUSH_COLOR_YELLOW_LO : PUSH_COLOR_GREEN_LO));
};

ScaleLayoutMode.prototype.updateSecondRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (102 + i, PUSH_COLOR2_BLACK);
};
