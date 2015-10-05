// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

// The base class for all device editing modes
function AbstractDeviceMode (model)
{
    BaseMode.call (this, model);
    if (!model)
        return;
    
    this.isTemporary = false;
    this.showDevices = true;
    this.cursorDevice = this.model.getCursorDevice ();
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
AbstractDeviceMode.prototype.onFirstRowBank = function (index) {};
AbstractDeviceMode.prototype.updateFirstRowBank = function () {};

AbstractDeviceMode.prototype.canSelectPreviousPage = function ()
{
    return this.showDevices ? this.cursorDevice.canSelectPreviousFX () : this.hasPreviousPage ();
};
 
AbstractDeviceMode.prototype.canSelectNextPage = function ()
{
    return this.showDevices ? this.cursorDevice.canSelectNextFX () : this.hasNextPage ();
};

AbstractDeviceMode.prototype.selectPreviousPage = function ()
{
    if (this.showDevices)
        this.cursorDevice.selectPrevious ();
    else
        this.previousPage ();
};

AbstractDeviceMode.prototype.selectNextPage = function ()
{
    if (this.showDevices)
        this.cursorDevice.selectNext ();
    else
        this.nextPage ();
};

AbstractDeviceMode.prototype.selectPreviousPageBank = function ()
{
    if (this.showDevices)
        this.cursorDevice.selectPreviousBank ();
    else
        this.previousPageBank ();
};

AbstractDeviceMode.prototype.selectNextPageBank = function ()
{
    if (this.showDevices)
        this.cursorDevice.selectNextBank ();
    else
        this.nextPageBank ();
};

AbstractDeviceMode.prototype.onFirstRow = function (index)
{
    if (!this.model.hasSelectedDevice ())
        return;
    if (this.showDevices)
        this.cursorDevice.selectSibling (index);
    else
        this.onFirstRowBank (index);
};

AbstractDeviceMode.prototype.updateFirstRow = function ()
{
    if (!this.model.hasSelectedDevice ())
    {
        this.disableFirstRow ();
        return;
    }
    
    if (this.showDevices)
    {
        var bank = this.calcDeviceBank ();
        for (var i = 0; i < 8; i++)
            this.surface.setButton (20 + i, i < bank.pages.length && bank.pages[i].length > 0 ? (i == bank.page ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_YELLOW_LO) : PUSH_COLOR_BLACK);
    }
    else
        this.updateFirstRowBank ();
};

AbstractDeviceMode.prototype.onSecondRow = function (index)
{
    if (!this.model.hasSelectedDevice ())
        return;
    if (index == 0)
        this.cursorDevice.toggleEnabledState ();
    else if (index == 7)
        this.cursorDevice.toggleWindowOpen ();
};

AbstractDeviceMode.prototype.updateSecondRow = function ()
{
    if (!this.model.hasSelectedDevice ())
    {
        this.disableSecondRow ();
        return;
    }
    var selDevice = this.model.getSelectedDevice ();
    this.surface.setButton (102, selDevice.enabled ? PUSH_COLOR2_GREEN : PUSH_COLOR2_GREY_LO);
    for (var i = 1; i < 7; i++)
        this.surface.setButton (102 + i, PUSH_COLOR2_BLACK);
    this.surface.setButton (109, selDevice.isPlugin ? (this.cursorDevice.isWindowOpen () ? PUSH_COLOR2_TURQUOISE_HI : PUSH_COLOR2_GREY_LO) : PUSH_COLOR2_BLACK);
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
        this.drawBanks (d, this.calcDeviceBank ());
    else
        this.updateBanks (d);
        
    d.allDone ();
};

AbstractDeviceMode.prototype.updateBanks = function (d)
{
    var bank = this.calcBank ();
    if (bank != null)
        this.drawBanks (d, bank);
};

AbstractDeviceMode.prototype.drawBanks = function (d, bank)
{
    for (var p = 0; p < 8; p++)
    {
        var index = bank.offset + p;
        d.setCell (3, p, index < bank.pages.length ? ((index == bank.page ? Display.RIGHT_ARROW : "") + bank.pages[index]) : "", Display.FORMAT_RAW);
    }
};

AbstractDeviceMode.prototype.calcDeviceBank = function ()
{
    var pages = [];
    for (var i = 0; i < 8; i++)
        pages.push (this.cursorDevice.getSiblingDeviceName (i));
    return { pages: pages, page: this.cursorDevice.getPositionInBank (), offset: 0 };
};