// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

// The base class for all device editing modes
function AbstractDeviceMode (model)
{
    BaseMode.call (this, model);
    this.isTemporary = false;
    
    this.showDevices = false;
}
AbstractDeviceMode.prototype = new BaseMode ();

AbstractDeviceMode.prototype.setShowDevices = function (enable)
{
    this.showDevices = enable;
};

// Abstract functions
AbstractDeviceMode.prototype.updateParameters = function (display) {};
AbstractDeviceMode.prototype.calcBank = function () { return null; };
AbstractDeviceMode.prototype.hasPreviousPage = function () { return false; };
AbstractDeviceMode.prototype.hasNextPage = function () { return false; };
AbstractDeviceMode.prototype.previousPage = function () {};
AbstractDeviceMode.prototype.nextPage = function () {};
AbstractDeviceMode.prototype.previousPageBank = function () {};
AbstractDeviceMode.prototype.nextPageBank = function () {};


AbstractDeviceMode.prototype.onSecondRow = function (index)
{
    if (index == 0)
        this.model.getCursorDevice ().toggleEnabledState ();
    else if (index == 7)
        this.model.getCursorDevice ().toggleWindowOpen ();
};

AbstractDeviceMode.prototype.updateSecondRow = function ()
{
    this.disableSecondRow ();
    this.surface.setButton (102, this.model.getSelectedDevice ().enabled ? PUSH_COLOR2_GREEN_HI : PUSH_COLOR2_GREY_LO);
    this.surface.setButton (109, this.model.getCursorDevice ().isWindowOpen () ? PUSH_COLOR2_TURQUOISE_HI : PUSH_COLOR2_GREY_LO);
};

AbstractDeviceMode.prototype.updateDisplay = function () 
{
    var d = this.surface.getDisplay ();
    d.clear ();
    
    if (!this.model.hasSelectedDevice ())
    {
        d.setBlock (1, 1, '    Please select').setBlock (1, 2, 'a device...    ').allDone ();
        return;
    }

    // Row 1 & 2
    this.updateParameters (d);
    
    // Row 3
    d.setBlock (2, 0, 'Selected Device:').setBlock (2, 1, this.model.getSelectedDevice ().name);
    
    // Row 4
    if (this.showDevices)
    {
        // TODO
        for (var d = 0; d < 8; p++)
        {
            var index = bank.offset + p;
            d.setCell (3, d, "Device " + (d + 1), Display.FORMAT_RAW);
        }
    }
    else
        this.updateBanks (d);
        
    d.allDone ();
};

AbstractDeviceMode.prototype.updateBanks = function (d)
{
    var bank = this.calcBank ();
    if (bank == null)
        return;
    for (var p = 0; p < 8; p++)
    {
        var index = bank.offset + p;
        d.setCell (3, p, index < bank.pages.length ? ((index == bank.page ? Display.RIGHT_ARROW : "") + bank.pages[index]) : "", Display.FORMAT_RAW);
    }
};
