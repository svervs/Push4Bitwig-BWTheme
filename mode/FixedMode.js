// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
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
    this.surface.restoreMode ();
};

FixedMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    var tb = this.model.getCurrentTrackBank ();
    
    if (Config.isPush2)
    {
        var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
        for (var i = 0; i < 8; i++)
        {
            message.addOptionElement ("", "", false, i == 0 ? "New Clip Length" : "", FixedMode.CLIP_LENGTHS[i], 
                                      tb.getNewClipLength () == i);
        }
        message.send ();
    }
    else
    {
        d.clear ().setBlock (1, 0, 'New Clip Length:');
        for (var i = 0; i < 8; i++)
            d.setCell (3, i, (tb.getNewClipLength () == i ? Display.RIGHT_ARROW : '') + FixedMode.CLIP_LENGTHS[i]);
        d.allDone ();
    }
};

FixedMode.prototype.updateFirstRow = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    for (var i = 0; i < 8; i++)
        this.surface.setButton (20 + i, tb.getNewClipLength () == i ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
};
