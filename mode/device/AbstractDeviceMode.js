// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

// The base class for all device editing modes
function AbstractDeviceMode (model)
{
    BaseMode.call (this, model);
    this.isTemporary = false;
    
    this.showDevices = true;
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
    return this.showDevices ? this.model.getCursorDevice ().canSelectPreviousFX () : this.hasPreviousPage ();
};
 
AbstractDeviceMode.prototype.canSelectNextPage = function ()
{
    return this.showDevices ? this.model.getCursorDevice ().canSelectNextFX () : this.hasNextPage ();
};

AbstractDeviceMode.prototype.selectPreviousPage = function ()
{
    if (this.showDevices)
        this.model.getCursorDevice ().selectPrevious ();
    else
        this.previousPage ();
};

AbstractDeviceMode.prototype.selectNextPage = function ()
{
    if (this.showDevices)
        this.model.getCursorDevice ().selectNext ();
    else
        this.nextPage ();
};

AbstractDeviceMode.prototype.selectPreviousPageBank = function ()
{
    if (this.showDevices)
    {
        var tb = this.model.getCurrentTrackBank ();
        var sel = tb.getSelectedTrack ();
        if (sel)
            tb.nextDeviceBank (sel.index);
    }
    else
        this.previousPageBank ();
};

AbstractDeviceMode.prototype.selectNextPageBank = function ()
{
    if (this.showDevices)
    {
        var tb = this.model.getCurrentTrackBank ();
        var sel = tb.getSelectedTrack ();
        if (sel)
            tb.previousDeviceBank (sel.index);
    }
    else
        this.nextPageBank ();
};

AbstractDeviceMode.prototype.onFirstRow = function (index)
{
    if (this.showDevices)
        this.model.getCursorDevice ().selectSibling (index);
    else
        this.onFirstRowBank (index);
};

AbstractDeviceMode.prototype.updateFirstRow = function ()
{
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
        this.model.getCursorDevice ().toggleEnabledState ();
    else if (index == 7)
        this.model.getCursorDevice ().toggleWindowOpen ();
};

AbstractDeviceMode.prototype.updateSecondRow = function ()
{
    this.disableSecondRow ();
    if (!this.model.hasSelectedDevice ())
        return;
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
    var cd = this.model.getCursorDevice ();
    var selectedPage = 0;
    var pages = [];
    if (cd.isNested ())
    {
        // TODO API extension required
        for (var i = 0; i < 8; i++)
        {
            // var index = bank.offset + i;
            pages.push ("Device " + (i + 1));
        }
    }
    else
    {
        var name = cd.getSelectedDevice ().name;
        var selectedTrack = this.model.getCurrentTrackBank ().getSelectedTrack ();
        for (var i = 0; i < 8; i++)
        {
            pages.push (selectedTrack.devices[i]);
            if (selectedTrack.devices[i] == name)
                selectedPage = i;
        }
    }
    return { pages: pages, page: selectedPage, offset: 0 };
};