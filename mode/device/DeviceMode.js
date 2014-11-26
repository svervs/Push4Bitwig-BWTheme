// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_DEVICE;
    this.isTemporary = false;
}
DeviceMode.prototype = new BaseMode ();

DeviceMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    if (isTouched && this.surface.isDeletePressed ())
    {
        this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
        this.model.getCursorDevice ().resetParameter (index);
    }
};

DeviceMode.prototype.onValueKnob = function (index, value)
{
    var param = this.model.getCursorDevice ().getFXParam (index);
    param.value = this.surface.changeValue (value, param.value);
    this.model.getCursorDevice ().setParameter (index, param.value);
};

DeviceMode.prototype.onFirstRow = function (index)
{
    // TODO Needs to select a device
    var bank = this.calcBank ();
    if (bank != null)
        this.model.getCursorDevice ().setSelectedParameterPage (bank.offset + index);
};

DeviceMode.prototype.onSecondRow = function (index)
{
    if (index == 0)
        this.model.getCursorDevice ().toggleEnabledState ();
    else if (index == 7)
        this.model.getCursorDevice ().toggleWindowOpen ();
};

DeviceMode.prototype.updateDisplay = function () 
{
    var d = this.surface.getDisplay ();
    if (this.model.hasSelectedDevice ())
    {
        var selectedDevice = this.model.getSelectedDevice ();
        var cursorDevice = this.model.getCursorDevice ();

        for (var i = 0; i < 8; i++)
        {
            var param = cursorDevice.getFXParam (i);
            d.setCell (0, i, param.name, Display.FORMAT_RAW)
             .setCell (1, i, param.valueStr, Display.FORMAT_RAW);
        }

        d.setBlock (2, 0, 'Selected', Display.FORMAT_RAW).setCell (2, 1, 'Device: ', Display.FORMAT_RAW)
         .setBlock (2, 1, selectedDevice.name)
         .clearBlock (2, 2).clearBlock (2, 3).done (2);

         
        // TODO Needs to draw the devices

        var bank = this.calcBank ();
        if (bank == null)
            d.clearRow (3);
        else
        {
            for (var p = 0; p < 8; p++)
            {
                var index = bank.offset + p;
                d.setCell (3, p, index < bank.pages.length ? ((index == bank.page ? Display.RIGHT_ARROW : "") + bank.pages[index]) : "", Display.FORMAT_RAW);
            }
        }



    }
    else
        d.clear ().setBlock (1, 1, '    Please select').setBlock (1, 2, 'a Device...    ').clearRow (3);
    d.allDone ();
};

DeviceMode.prototype.updateFirstRow = function ()
{
    // TODO Needs to draw for devices
    
    if (!this.model.hasSelectedDevice ())
    {
        this.disableFirstRow ();
        return;
    }
    
    var bank = this.calcBank ();
    if (bank == null)
    {
        this.disableFirstRow ();
        return;
    }
        
    for (var p = 0; p < 8; p++)
    {
        var index = bank.offset + p;
        this.surface.setButton (20 + p, index < bank.pages.length ? (index == bank.page ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_YELLOW_LO) : PUSH_COLOR_BLACK);
    }
};

DeviceMode.prototype.updateSecondRow = function ()
{
    this.disableSecondRow ();
    
    this.surface.setButton (102, this.model.getSelectedDevice ().enabled ? PUSH_COLOR2_GREEN_HI : PUSH_COLOR2_GREY_LO);
    this.surface.setButton (109, this.model.getCursorDevice ().isWindowOpen () ? PUSH_COLOR2_TURQUOISE_HI : PUSH_COLOR2_GREY_LO);
};

DeviceMode.prototype.calcBank = function ()
{
    var device = this.model.getCursorDevice ();
    var pages = device.getParameterPageNames ();
    var page = device.getSelectedParameterPage ();
    if (pages.length == 0)
        return null;
    if (page >= pages.length || page < 0)
        page = 0;
    return { pages: pages, page: page, offset: Math.floor (page / 8) * 8 };
};
