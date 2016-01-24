// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
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
    this.scales.setScaleLayout (index);
    this.surface.getActiveView ().updateNoteMapping ();
    Config.setScaleLayout (Scales.LAYOUT_NAMES[this.scales.getScaleLayout ()]);
};

ScaleLayoutMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    var sl = this.scales.getScaleLayout ();
    
    if (Config.isPush2)
    {
        var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
        for (var i = 0; i < 8; i++)
            message.addOptionElement ("", "", false, i == 0 ? "Scale layout" : "", Scales.LAYOUT_NAMES[i], sl == i);
        message.send ();
    }
    else
    {
        d.clear ().setBlock (1, 0, 'Scale layout:');
        for (var i = 0; i < Scales.LAYOUT_NAMES.length; i++)
            d.setCell (3, i, (sl == i ? Display.RIGHT_ARROW : ' ') + Scales.LAYOUT_NAMES[i]);
        d.allDone ();
    }
};

ScaleLayoutMode.prototype.updateFirstRow = function ()
{
    var sl = this.scales.getScaleLayout ();
    for (var i = 0; i < 8; i++)
        this.surface.updateButton (20 + i, sl == i ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
};
